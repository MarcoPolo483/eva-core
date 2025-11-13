import { makePlan } from "../domain/plan.js";
import { Orchestrator } from "../runtime/orchestrator.js";

const plan = makePlan("demo", [
  { name: "hello", action: async () => ({ ok: true, value: { output: "world" } } as any) }
]);

const orch = new Orchestrator();
void orch.run(plan).then((r) => {
  console.log("Done:", r.ok);
  if (r.ok) console.log("Steps:", r.value.steps.length);
});