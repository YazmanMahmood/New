import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { ContactPage } from "@/components/contact/ContactPage";

export const metadata: Metadata = pageMetadata({
  title: "Contact us",
  description: "Email, call or visit Artemis UAV in Lahore. Tell us about your site, your mission or the drone you need.",
  path: "/contact",
});

export default function Contact() {
  return <ContactPage />;
}
