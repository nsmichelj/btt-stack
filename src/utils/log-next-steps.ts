export function logNextSteps({ projectName, pkgManager }: { projectName: string; pkgManager: string }) {
  console.log("🎉 Your project is ready!"); 
  console.log("");
  console.log(`Next steps:`);
  console.log(`  cd ${projectName}`);
  console.log(`  ${pkgManager} run dev`);
  console.log("");
  console.log(`🚀 Start building something better.`);
}