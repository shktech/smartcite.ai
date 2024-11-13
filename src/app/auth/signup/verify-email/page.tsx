"use client";
import { Button, LoadingOverlay } from "@mantine/core";
import { useSearchParams } from "next/navigation";
import { IconMessage, IconSend } from "@tabler/icons-react";
import {
  getSuperAdminToken,
  sendVerifyEmail,
} from "@/services/keycloak/user.service";
import { Notifications, notifications } from "@mantine/notifications";
import { useState } from "react";

export default function AuthenticationForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const userid = searchParams.get("userid") as string;
  const resendEmail = async () => {
    try {
      setIsLoading(true);
      const adminToken = await getSuperAdminToken();
      const sendEmail = await sendVerifyEmail(userid, adminToken.access_token);
      if (!sendEmail) throw new Error("Error found");
      notifications.show({
        title: "Successfully sent a verify email",
        message: "",
        color: "green",
      });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log("Error found", error);
      notifications.show({
        title: "Fail to send a verify email",
        message: "",
        color: "red",
      });
      return "Error found";
    }
  };
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#fafafa] relative">
      <Notifications position="top-right" zIndex={1000} />
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ color: "pink", type: "bars" }}
      />
      <div className="w-[480px] shadow-lg py-10 flex flex-col p-8 bg-white rounded-lg justify-center items-center">
        <div className="bg-[#4bae4f] rounded-full w-14 h-14 flex items-center justify-center">
          <IconMessage color="white" size={32} stroke={2} />
        </div>
        <div className="py-4 flex justify-center items-center flex-col">
          <span className="font-bold">Verification Email Sent</span> We’ve sent a verification email. Please check your inbox (and spam/junk folder) and click the link to complete your signup. It may take up to 10 mins. If not, click resend.
        </div>
        <Button
          variant="default"
          leftSection={<IconSend size={14} />}
          onClick={resendEmail}
        >
          Resend Email
        </Button>
      </div>
    </div>
  );
}
