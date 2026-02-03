export async function shareInvite(): Promise<"shared" | "copied" | "error"> {
  const inviteUrl = "real link";

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Join my family on MyApp",
        text: "Click the link below to join our family:",
        url: inviteUrl,
      });
      return "shared";
    } catch (err) {
      console.error("Share canceled or failed:", err);
      return "error";
    }
  } else {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      return "copied";
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      return "error";
    }
  }
}
