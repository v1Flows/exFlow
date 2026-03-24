import { updateSession } from "@/lib/auth/updateSession";

const TEN_MINUTES = 600000;

setInterval(async () => {
  await updateSession();
}, TEN_MINUTES);
