import { Button } from "../ui/button";
import { LiteralUnion, signIn } from "next-auth/react";
import { ReactNode } from "react";
import { BuiltInProviderType } from "next-auth/providers/index";

type siginButtonProps = {
  provider: LiteralUnion<BuiltInProviderType>;
  callbackUrl: string;
  text: string;
  icon: ReactNode;
};

export function SigninButton({
  provider,
  callbackUrl,
  text,
  icon,
}: siginButtonProps) {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => signIn(provider, { callbackUrl: callbackUrl })}
    >
      {text}
    </Button>
  );
}
