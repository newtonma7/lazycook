"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
  type Simulation,
} from "d3-force";
import { drag as d3Drag } from "d3-drag";
import { select } from "d3-selection";
import { NODE_CHILDREN } from "./node-children";
import { NodeSidebar } from "./node-sidebar";

const COLORS: Record<string, string> = {
  ink: "#2A2118",
  cream: "#FBF7F0",
  tomato: "#E8432B",
  sage: "#4DAF5C",
  turmeric: "#E5A813",
  eggplant: "#8B3FA0",
  berry: "#D1366E",
  olive: "#8AAD42",
  border: "#DDD3C2",
};

const ORBIT_DEFS = [
  { id: "pantry", label: "Pantry", color: COLORS.tomato, href: "/dashboard?tab=pantry" },
  { id: "recipes", label: "Recipes", color: COLORS.sage, href: "/dashboard?tab=recipe" },
  { id: "ingredients", label: "Ingredients", color: COLORS.turmeric, href: "/dashboard?tab=ingredient" },
  { id: "mealplan", label: "Meal Plans", color: COLORS.eggplant, href: "/dashboard?tab=meal_plan" },
  { id: "aichef", label: "AI Chef", color: COLORS.berry, href: "/dashboard?tab=ai-recipe" },
  { id: "account", label: "Account", color: COLORS.olive, href: "/dashboard?tab=account" },
] as const;

const N = ORBIT_DEFS.length;
const CENTER_PX = 130;
const NODE_PX = 85;
const CHILD_PX = 55;

interface GNode extends SimulationNodeDatum {
  id: string;
  label: string;
  color: string;
  href: string;
  size: number;
  isCenter: boolean;
  isChild?: boolean;
  parentId?: string;
}

type GLink = SimulationLinkDatum<GNode>;

export function OrbitGraph() {
  const router = useRouter();
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const nodeEls = useRef<(HTMLDivElement | null)[]>([]);
  const lineEls = useRef<(SVGLineElement | null)[]>([]);
  const ringRef = useRef<SVGCircleElement>(null);
  const wasDragged = useRef(false);

  const simRef = useRef<Simulation<GNode, GLink> | null>(null);
  const orbitalNodesRef = useRef<GNode[]>([]);
  const allNodesRef = useRef<GNode[]>([]);
  const allLinksRef = useRef<GLink[]>([]);
  const centerNodeRef = useRef<GNode | null>(null);
  const hubRef = useRef({ x: 0, y: 0, r: 0 });
  const childNodeEls = useRef<Map<string, HTMLDivElement>>(new Map());
  const childLineEls = useRef<Map<string, SVGLineElement>>(new Map());
  const activeChildIds = useRef<string[]>([]);

  /* ── initial d3 setup ── */
  useEffect(() => {
    const box = containerRef.current;
    if (!box) return;

    const rect = box.getBoundingClientRect();
    const hub = hubRef.current;
    hub.x = rect.width / 2;
    hub.y = rect.height / 2;
    hub.r = Math.min(Math.max(Math.min(rect.width, rect.height) * 0.28, 140), 300);

    if (centerRef.current) {
      centerRef.current.style.transform = `translate(${hub.x - CENTER_PX / 2}px, ${hub.y - CENTER_PX / 2}px)`;
    }
    if (ringRef.current) {
      ringRef.current.setAttribute("cx", String(hub.x));
      ringRef.current.setAttribute("cy", String(hub.y));
      ringRef.current.setAttribute("r", String(hub.r));
    }

    const centerNode: GNode = {
      id: "center", label: "lazycook", color: COLORS.ink, href: "/home",
      size: CENTER_PX, isCenter: true, x: hub.x, y: hub.y, fx: hub.x, fy: hub.y,
    };
    centerNodeRef.current = centerNode;

    const orbitals: GNode[] = ORBIT_DEFS.map((def, i) => {
      const a = (Math.PI * 2 / N) * i - Math.PI / 2;
      return {
        ...def, size: NODE_PX, isCenter: false,
        x: hub.x + hub.r * Math.cos(a),
        y: hub.y + hub.r * Math.sin(a),
      };
    });
    orbitalNodesRef.current = orbitals;

    const nodes: GNode[] = [centerNode, ...orbitals];
    const links: GLink[] = orbitals.map(n => ({ source: "center" as unknown as GNode, target: n.id as unknown as GNode }));
    allNodesRef.current = nodes;
    allLinksRef.current = links;

    function orbitForce(alpha: number) {
      for (const n of orbitalNodesRef.current) {
        if (n.fx != null || n.isChild) continue;
        const dx = (n.x ?? hub.x) - hub.x;
        const dy = (n.y ?? hub.y) - hub.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) return;
        n.vx! += (-dy / dist) * 0.18 * alpha;
        n.vy! += (dx / dist) * 0.18 * alpha;
      }
    }
    (orbitForce as any).initialize = () => {};

    const sim = forceSimulation<GNode>(nodes)
      .force("link", forceLink<GNode, GLink>(links).id(d => d.id).distance(hub.r).strength(0.2))
      .force("charge", forceManyBody<GNode>().strength(-200))
      .force("collide", forceCollide<GNode>().radius(d => d.size / 2 + 12).strength(0.9))
      .force("orbit", orbitForce as any)
      .alphaDecay(0.0005)
      .alphaTarget(0.02)
      .velocityDecay(0.3)
      .on("tick", tickHandler);

    simRef.current = sim;

    function tickHandler() {
      const orbitals = orbitalNodesRef.current;
      for (let i = 0; i < orbitals.length; i++) {
        const n = orbitals[i];
        if (n.isChild) continue;
        const el = nodeEls.current[i];
        if (el) el.style.transform = `translate(${(n.x ?? 0) - NODE_PX / 2}px, ${(n.y ?? 0) - NODE_PX / 2}px)`;
        const line = lineEls.current[i];
        if (line) {
          line.setAttribute("x1", String(centerNode.x ?? hub.x));
          line.setAttribute("y1", String(centerNode.y ?? hub.y));
          line.setAttribute("x2", String(n.x ?? 0));
          line.setAttribute("y2", String(n.y ?? 0));
        }
      }

      for (const cid of activeChildIds.current) {
        const cNode = allNodesRef.current.find(nn => nn.id === cid);
        if (!cNode) continue;
        const cel = childNodeEls.current.get(cid);
        if (cel) cel.style.transform = `translate(${(cNode.x ?? 0) - CHILD_PX / 2}px, ${(cNode.y ?? 0) - CHILD_PX / 2}px)`;
        const cline = childLineEls.current.get(cid);
        if (cline && cNode.parentId) {
          const parent = allNodesRef.current.find(nn => nn.id === cNode.parentId);
          if (parent) {
            cline.setAttribute("x1", String(parent.x ?? 0));
            cline.setAttribute("y1", String(parent.y ?? 0));
            cline.setAttribute("x2", String(cNode.x ?? 0));
            cline.setAttribute("y2", String(cNode.y ?? 0));
          }
        }
      }
    }

    const dragBeh = d3Drag<HTMLDivElement, GNode>()
      .container(function () { return box; })
      .on("start", function (event, d) {
        wasDragged.current = false;
        if (!event.active) sim.alphaTarget(0.06).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", function (event, d) {
        wasDragged.current = true;
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", function (event, d) {
        if (!event.active) sim.alphaTarget(0.02);
        d.fx = null;
        d.fy = null;
      });

    for (let i = 0; i < orbitals.length; i++) {
      const el = nodeEls.current[i];
      if (el) select<HTMLDivElement, GNode>(el).datum(orbitals[i]).call(dragBeh);
    }

    const onResize = () => {
      const { width: w, height: h } = box.getBoundingClientRect();
      hub.x = w / 2;
      hub.y = h / 2;
      hub.r = Math.min(Math.max(Math.min(w, h) * 0.28, 140), 300);
      centerNode.fx = hub.x;
      centerNode.fy = hub.y;
      centerNode.x = hub.x;
      centerNode.y = hub.y;
      if (centerRef.current) centerRef.current.style.transform = `translate(${hub.x - CENTER_PX / 2}px, ${hub.y - CENTER_PX / 2}px)`;
      if (ringRef.current) {
        ringRef.current.setAttribute("cx", String(hub.x));
        ringRef.current.setAttribute("cy", String(hub.y));
        ringRef.current.setAttribute("r", String(hub.r));
      }
      const lf = sim.force("link");
      if (lf && typeof (lf as any).distance === "function") (lf as any).distance(hub.r);
      sim.alpha(0.3).restart();
    };
    window.addEventListener("resize", onResize);
    return () => { sim.stop(); window.removeEventListener("resize", onResize); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── expand / collapse children when focusedId changes ── */
  useEffect(() => {
    const sim = simRef.current;
    if (!sim) return;

    const hub = hubRef.current;
    const box = containerRef.current;

    removeAllChildren();

    if (!focusedId) {
      if (graphRef.current) {
        graphRef.current.style.transition = "transform 0.6s cubic-bezier(0.16,1,0.3,1)";
        graphRef.current.style.transform = "scale(1) translate(0px, 0px)";
      }
      sim.alpha(0.2).restart();
      return;
    }

    const parentNode = orbitalNodesRef.current.find(n => n.id === focusedId);
    if (!parentNode) return;

    const children = NODE_CHILDREN[focusedId] ?? [];
    if (children.length === 0) return;

    const parentDef = ORBIT_DEFS.find(d => d.id === focusedId);
    const parentColor = parentDef?.color ?? COLORS.ink;

    const childNodes: GNode[] = children.map((c, i) => {
      const a = (Math.PI * 2 / children.length) * i - Math.PI / 2;
      const childR = 80;
      return {
        id: c.id,
        label: c.label,
        color: parentColor,
        href: parentDef?.href ?? "/dashboard",
        size: CHILD_PX,
        isCenter: false,
        isChild: true,
        parentId: focusedId,
        x: (parentNode.x ?? hub.x) + childR * Math.cos(a),
        y: (parentNode.y ?? hub.y) + childR * Math.sin(a),
      };
    });

    const childLinks: GLink[] = childNodes.map(cn => ({
      source: focusedId as unknown as GNode,
      target: cn.id as unknown as GNode,
    }));

    activeChildIds.current = childNodes.map(cn => cn.id);
    allNodesRef.current = [...allNodesRef.current, ...childNodes];
    allLinksRef.current = [...allLinksRef.current, ...childLinks];

    sim.nodes(allNodesRef.current);
    const linkForce = sim.force("link") as ReturnType<typeof forceLink<GNode, GLink>> | null;
    if (linkForce) {
      linkForce.links(allLinksRef.current);
      linkForce.distance((l: any) => {
        const src = typeof l.source === "object" ? l.source : null;
        const tgt = typeof l.target === "object" ? l.target : null;
        if (src?.isChild || tgt?.isChild) return 80;
        return hub.r;
      });
    }

    sim.alpha(0.4).restart();

    if (graphRef.current && box) {
      const bRect = box.getBoundingClientRect();
      const cx = bRect.width / 2;
      const cy = bRect.height / 2;
      const dx = cx - (parentNode.x ?? cx);
      const dy = cy - (parentNode.y ?? cy);
      graphRef.current.style.transition = "transform 0.6s cubic-bezier(0.16,1,0.3,1)";
      graphRef.current.style.transform = `scale(1.4) translate(${dx * 0.3}px, ${dy * 0.3}px)`;
    }

    function removeAllChildren() {
      if (activeChildIds.current.length === 0) return;

      childNodeEls.current.forEach(el => el.remove());
      childNodeEls.current.clear();
      childLineEls.current.forEach(el => el.remove());
      childLineEls.current.clear();

      allNodesRef.current = allNodesRef.current.filter(n => !n.isChild);
      allLinksRef.current = allLinksRef.current.filter(l => {
        const tgt = typeof l.target === "object" ? (l.target as GNode) : null;
        return !tgt?.isChild;
      });
      activeChildIds.current = [];

      if (sim) {
        sim.nodes(allNodesRef.current);
        const lf = sim.force("link") as ReturnType<typeof forceLink<GNode, GLink>> | null;
        if (lf) {
          lf.links(allLinksRef.current);
          lf.distance(hub.r);
        }
      }
    }

    return () => { removeAllChildren(); };
  }, [focusedId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── create child DOM elements imperatively ── */
  useEffect(() => {
    if (!focusedId) return;

    const sim = simRef.current;
    const graph = graphRef.current;
    const svg = graph?.querySelector("svg");
    if (!sim || !graph || !svg) return;

    const parentDef = ORBIT_DEFS.find(d => d.id === focusedId);
    const parentColor = parentDef?.color ?? COLORS.ink;
    const children = NODE_CHILDREN[focusedId] ?? [];

    for (const child of children) {
      if (childNodeEls.current.has(child.id)) continue;

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("stroke", parentColor);
      line.setAttribute("stroke-width", "1.2");
      line.setAttribute("opacity", "0.2");
      line.setAttribute("stroke-dasharray", "3 5");
      svg.appendChild(line);
      childLineEls.current.set(child.id, line);

      const wrapper = document.createElement("div");
      wrapper.className = "absolute top-0 left-0 animate-fade-in";
      wrapper.style.width = `${CHILD_PX}px`;
      wrapper.style.height = `${CHILD_PX}px`;

      const inner = document.createElement("div");
      inner.className = "flex w-full h-full items-center justify-center rounded-full bg-cream/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md hover:scale-110 cursor-pointer";
      inner.style.border = `2px solid ${parentColor}40`;

      const label = document.createElement("span");
      label.className = "font-body text-[0.6rem] font-medium tracking-wide text-center leading-tight px-1 pointer-events-none";
      label.style.color = parentColor;
      label.textContent = child.label;

      inner.appendChild(label);
      wrapper.appendChild(inner);
      graph.appendChild(wrapper);
      childNodeEls.current.set(child.id, wrapper);

      const cNode = allNodesRef.current.find(n => n.id === child.id);
      if (cNode) {
        select<HTMLDivElement, GNode>(wrapper).datum(cNode).call(
          d3Drag<HTMLDivElement, GNode>()
            .container(function () { return containerRef.current!; })
            .on("start", function (event, d) {
              if (!event.active) sim.alphaTarget(0.06).restart();
              d.fx = d.x; d.fy = d.y;
            })
            .on("drag", function (event, d) {
              d.fx = event.x; d.fy = event.y;
            })
            .on("end", function (event, d) {
              if (!event.active) sim.alphaTarget(0.02);
              d.fx = null; d.fy = null;
            })
        );
      }
    }
  }, [focusedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNodeClick = useCallback((nodeId: string, href: string) => {
    if (wasDragged.current) return;
    const children = NODE_CHILDREN[nodeId];
    if (children && children.length > 0) {
      setFocusedId(prev => prev === nodeId ? null : nodeId);
    } else {
      router.push(href);
    }
  }, [router]);

  const handleClose = useCallback(() => {
    setFocusedId(null);
  }, []);

  const focusedDef = focusedId ? ORBIT_DEFS.find(d => d.id === focusedId) : null;

  return (
    <>
      <div ref={containerRef} className="relative w-full h-screen select-none overflow-hidden">
        <div
          ref={graphRef}
          className="relative w-full h-full"
          style={{ transformOrigin: "center center" }}
        >
          {/* SVG connections + orbit ring */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
            <circle
              ref={ringRef}
              fill="none"
              stroke={COLORS.border}
              strokeWidth="1"
              strokeDasharray="6 12"
              opacity={focusedId ? "0.1" : "0.3"}
              style={{ transition: "opacity 0.4s ease" }}
            />
            {ORBIT_DEFS.map((node, i) => (
              <line
                key={node.id}
                ref={(el) => { lineEls.current[i] = el; }}
                stroke={node.color}
                strokeWidth="1.5"
                opacity={focusedId ? (focusedId === node.id ? "0.3" : "0.05") : "0.15"}
                style={{ transition: "opacity 0.4s ease" }}
              />
            ))}
          </svg>

          {/* Center node */}
          <div
            ref={centerRef}
            className="absolute top-0 left-0"
            style={{
              width: CENTER_PX, height: CENTER_PX,
              opacity: focusedId ? 0.3 : 1,
              transition: "opacity 0.4s ease",
            }}
          >
            <div className="w-full h-full rounded-full bg-cream border-2 border-ink/12 shadow-lg shadow-ink/8 flex items-center justify-center animate-breathe">
              <span className="font-display text-[1.7rem] italic text-ink tracking-tight select-none">
                lazycook
              </span>
            </div>
          </div>

          {/* Orbital nodes */}
          {ORBIT_DEFS.map((node, i) => {
            const isFocused = focusedId === node.id;
            const isDimmed = focusedId != null && !isFocused;
            return (
              <div
                key={node.id}
                ref={(el) => { nodeEls.current[i] = el; }}
                className="absolute top-0 left-0 cursor-grab active:cursor-grabbing touch-none"
                style={{
                  width: NODE_PX, height: NODE_PX,
                  opacity: isDimmed ? 0.2 : 1,
                  transition: "opacity 0.4s ease",
                  zIndex: isFocused ? 15 : 10,
                }}
                onClick={() => handleNodeClick(node.id, node.href)}
              >
                <div
                  className={`orbit-node-inner flex w-full h-full items-center justify-center rounded-full bg-cream/90 backdrop-blur-sm shadow-md shadow-ink/5 transition-all duration-200 hover:shadow-lg hover:shadow-ink/10 ${isFocused ? "scale-115" : "hover:scale-105"}`}
                  style={{
                    border: `2.5px solid ${node.color}`,
                    boxShadow: isFocused ? `0 0 0 3px ${node.color}18, 0 0 16px ${node.color}10` : undefined,
                  }}
                >
                  <span
                    className="font-body text-[0.8rem] font-medium tracking-wide pointer-events-none"
                    style={{ color: node.color }}
                  >
                    {node.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar */}
      {focusedId && focusedDef && (
        <NodeSidebar
          nodeLabel={focusedDef.label}
          nodeColor={focusedDef.color}
          children={NODE_CHILDREN[focusedId] ?? []}
          onClose={handleClose}
          onSelectChild={(child) => {
            router.push(focusedDef.href);
          }}
        />
      )}
    </>
  );
}
