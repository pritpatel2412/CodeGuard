import Canyon404 from "@/components/ui/canyon-404";

export default function NotFound() {
  return (
    <Canyon404 
      errorCode="404"
      title="Lost in the Canyon"
      subtitle="The page you're looking for has wandered into the digital desert."
      homeText="Return to Dashboard"
    />
  );
}
