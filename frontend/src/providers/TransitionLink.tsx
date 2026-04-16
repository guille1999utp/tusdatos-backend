import { useNavigate } from "react-router-dom";
import { useTransition } from "./TransitionContext";

export default function TransitionLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { startTransition } = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    startTransition(() => {
      navigate(to);
    });
  };

  return (
    <a href={to} onClick={handleClick}>
      {children}
    </a>
  );
}
