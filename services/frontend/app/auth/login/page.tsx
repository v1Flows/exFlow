import LoginPageComponent from "@/components/auth/loginPage";
import PageGetSettings from "@/lib/fetch/page/settings";

export default async function LoginPage() {
  const settingsData = PageGetSettings();

  const [settings] = (await Promise.all([settingsData])) as any;

  return <LoginPageComponent settings={settings.data.settings} />;
}
