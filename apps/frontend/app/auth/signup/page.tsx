import SignUpPage from "@/components/auth/signupPage";
import PageGetSettings from "@/lib/fetch/page/settings";

export default async function SignupPage() {
  const settingsData = PageGetSettings();

  const [settings] = (await Promise.all([settingsData])) as any;

  return <SignUpPage settings={settings.data.settings} />;
}
