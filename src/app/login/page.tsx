const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error(error)
    alert("Erro ao entrar: " + error.message)
    return
  }

  // Verifica se o usuário já completou o quiz
  const { data: profile } = await supabase
    .from("profiles")
    .select("has_completed_quiz")
    .eq("id", data.user.id)
    .single()

  if (!profile?.has_completed_quiz) {
    router.push("/onboarding")
  } else {
    router.push("/dashboard")
  }
}
