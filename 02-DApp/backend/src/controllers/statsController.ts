import { Router } from "express";

const router = Router();

router.get("/", (res: any, req: any) => {
  res.send("Welcome to the stats endpoint!");
});

export default router;