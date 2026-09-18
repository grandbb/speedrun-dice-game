import { artifacts, deployScript } from "../rocketh/deploy.js";
import { parseEther } from "viem";

export default deployScript(
  async env => {
    const diceGame = env.get("DiceGame");
    const diceGameAddress = diceGame.address;

    const riggedRoll = await env.deploy("RiggedRoll", {
      account: env.namedAccounts.deployer,
      artifact: artifacts.RiggedRoll,
      args: [diceGameAddress],
    });

    const owner = await env.read(riggedRoll, { functionName: "owner" });
    if (owner.toLowerCase() === env.namedAccounts.deployer.toLowerCase()) {
      await env.execute(riggedRoll, {
        functionName: "transferOwnership",
        args: ["0x11315Cce8f009e4CB4234FFEAF2E860b84E5b0f6"],
        account: env.namedAccounts.deployer,
      });
    }
    // Testnet/local demonstration funding for the first predictable roll.
    const balance = BigInt(
      (await env.network.provider.request({
        method: "eth_getBalance",
        params: [riggedRoll.address, "latest"],
      })) as string,
    );
    if (balance < parseEther("0.002")) {
      await env.tx({
        account: env.namedAccounts.deployer,
        to: riggedRoll.address,
        value: parseEther("0.002") - balance,
      });
    }
  },
  { tags: ["RiggedRoll"] },
);
