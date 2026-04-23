import { deleteCurrentAccount, signInAccount, signOutAccount, signUpAccount, updateCurrentAccount } from "./actions";
import { getCurrentAccount, getRoleLabel } from "./account-auth";

type Props = {
    message?: string;
    error?: string;
};

function StatusBanner({ tone, text }: { tone: "error" | "success"; text: string }) {
    const classes =
        tone === "error"
            ? "border-red-300 bg-red-50 text-red-700"
            : "border-emerald-300 bg-emerald-50 text-emerald-700";

    return <p className={`rounded-md border px-4 py-3 text-sm ${classes}`}>{text}</p>;
}

function RoleButtons({ action }: { action: "signin" | "signup" }) {
    const labels = action === "signin" ? ["Sign in as Consumer", "Sign in as Admin"] : ["Sign up as Consumer", "Sign up as Admin"];

    return (
        <div className="flex flex-col gap-2 sm:flex-row">
            <button
                type="submit"
                name="role"
                value="consumer"
                className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
            >
                {labels[0]}
            </button>
            <button
                type="submit"
                name="role"
                value="admin"
                className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1"
            >
                {labels[1]}
            </button>
        </div>
    );
}

export async function AccountPanel({ message, error }: Props) {
    const currentAccount = await getCurrentAccount();

    return (
        <div className="space-y-6">
            {error ? <StatusBanner tone="error" text={error} /> : null}
            {message ? <StatusBanner tone="success" text={message} /> : null}

            {currentAccount ? (
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold text-zinc-900">Signed in</h3>
                            <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white">
                                {getRoleLabel(currentAccount.role)}
                            </span>
                        </div>

                        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Email</dt>
                                <dd className="mt-2 text-sm text-zinc-900">{currentAccount.email}</dd>
                            </div>
                            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">User ID</dt>
                                <dd className="mt-2 text-sm text-zinc-900">{currentAccount.userId}</dd>
                            </div>
                            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Username</dt>
                                <dd className="mt-2 text-sm text-zinc-900">{currentAccount.username ?? "Not stored on this table"}</dd>
                            </div>
                            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Status</dt>
                                <dd className="mt-2 text-sm text-zinc-900">{currentAccount.status ?? "Not stored on this table"}</dd>
                            </div>
                        </dl>

                        {currentAccount.createdAt ? (
                            <p className="mt-4 text-xs text-zinc-500">
                                Created {new Date(currentAccount.createdAt).toLocaleString()}
                            </p>
                        ) : null}
                    </section>

                    <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-zinc-900">Manage this account</h3>

                        <form action={updateCurrentAccount} className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="account-username" className="text-sm text-zinc-600">
                                    Username
                                </label>
                                <input
                                    id="account-username"
                                    name="username"
                                    type="text"
                                    required
                                    defaultValue={currentAccount.username ?? ""}
                                    className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="account-email" className="text-sm text-zinc-600">
                                    Email
                                </label>
                                <input
                                    id="account-email"
                                    name="email"
                                    type="email"
                                    required
                                    defaultValue={currentAccount.email}
                                    className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="account-password" className="text-sm text-zinc-600">
                                    New password
                                </label>
                                <input
                                    id="account-password"
                                    name="password"
                                    type="password"
                                    minLength={8}
                                    placeholder="Leave blank to keep the current password"
                                    className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                            >
                                Update my details
                            </button>
                        </form>

                        <form action={signOutAccount}>
                            <button
                                type="submit"
                                className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1"
                            >
                                Sign out
                            </button>
                        </form>

                        <form action={deleteCurrentAccount}>
                            <button
                                type="submit"
                                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                            >
                                Delete this account
                            </button>
                        </form>
                    </section>
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-zinc-900">Sign in</h3>
                        <p className="mt-2 text-sm text-zinc-600">Sign in with the email and password for your consumer or admin account.</p>

                        <form action={signInAccount} className="mt-5 space-y-4">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="signin-email" className="text-sm text-zinc-600">
                                    Email
                                </label>
                                <input
                                    id="signin-email"
                                    name="email"
                                    type="email"
                                    required
                                    className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="signin-password" className="text-sm text-zinc-600">
                                    Password
                                </label>
                                <input
                                    id="signin-password"
                                    name="password"
                                    type="password"
                                    required
                                    className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                            >
                                Sign in
                            </button>
                        </form>
                    </section>

                    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-zinc-900">Sign up</h3>
                        <p className="mt-2 text-sm text-zinc-600">Create either a consumer account or an admin account from the same screen.</p>

                        <form action={signUpAccount} className="mt-5 space-y-4">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="signup-username" className="text-sm text-zinc-600">
                                    Username
                                </label>
                                <input
                                    id="signup-username"
                                    name="username"
                                    type="text"
                                    required
                                    className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="signup-email" className="text-sm text-zinc-600">
                                    Email
                                </label>
                                <input
                                    id="signup-email"
                                    name="email"
                                    type="email"
                                    required
                                    className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="signup-password" className="text-sm text-zinc-600">
                                    Password
                                </label>
                                <input
                                    id="signup-password"
                                    name="password"
                                    type="password"
                                    required
                                    minLength={8}
                                    className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <RoleButtons action="signup" />
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}
