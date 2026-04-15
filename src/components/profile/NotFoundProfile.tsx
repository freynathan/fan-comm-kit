import { Link } from "react-router-dom";

export function NotFoundProfile({ username }: { username: string }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <h1 className="text-2xl font-bold text-[#0A1628] mb-2">
          This profile hasn't been claimed yet.
        </h1>
        <p className="text-gray-500 text-[15px] mb-6">
          tobe.fan/of/{username} is available.
        </p>
        <Link
          to="/onboarding"
          className="inline-flex items-center h-11 px-6 rounded-lg text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#0C447C" }}
        >
          Claim it free →
        </Link>
      </div>
    </div>
  );
}
