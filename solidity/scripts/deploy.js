async function main() {
  const Trace = await ethers.getContractFactory('Traceability');
  const trace = await Trace.deploy();
  await trace.deployed();
  console.log('Traceability deployed to:', trace.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});