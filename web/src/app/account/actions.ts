
export async function createAdminAccount(formData: FormData) {
  const username = normalizeUsername(formData.get("username"));
  const email = normalizeEmail(formData.get("email"));
  const password = normalizePassword(formData.get("password"));

  if (!username || !email || password.length < 8) {
    redirect(
      buildAccountRedirect({
        error: "Use a valid username, email, and a password with at least 8 characters.",
      })
    );
  }

  try {
    const existing = await findAccountByEmailNormalized(email);
    if (existing) {
      redirect(
        buildAccountRedirect({
          error: `This email is already registered.`,
        })
      );
    }

    const supabase = createSupabaseServerAuthClient();
    const passwordHash = hashPassword(password);

    const { error } = await supabase.from("admin").insert({
      username,
      email,
      password_hash: passwordHash,
    });

    if (error) {
      throw new Error(error.message ?? "Unable to create admin account.");
    }

    revalidatePath("/dashboard");
    redirect(
      buildAccountRedirect({ message: "Admin account created successfully." })
    );
  } catch (error) {
    unstable_rethrow(error);
    redirect(buildAccountRedirect({ error: getAccountMessage(error) }));
  }
}