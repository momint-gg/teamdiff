// Router
import { useRouter } from "next/router";
import { useEffect } from "react";
import MyTeam from "../myTeam";

export default function LeaguePlayRouter() {
  // Router params
  const router = useRouter();

  useEffect(() => {
    console.log("router: " + router.query.params);
  }, [router]);

  return <>{router.query && <MyTeam></MyTeam>}</>;
}
