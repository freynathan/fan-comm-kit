import { Link } from "react-router-dom";

export function ProfileFooter() {
  return (
    <footer className="border-t border-gray-100 mt-4">
      <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
        <span className="text-[12px] text-gray-400">
          Powered by{" "}
          <a href="https://tobe.fan" className="hover:underline" style={{ color: "#0C447C" }}>
            tobe.fan
          </a>
        </span>
        <Link
          to="/onboarding"
          className="h-8 px-4 rounded-lg text-[12px] font-medium border border-gray-300 text-gray-500 flex items-center transition-colors hover:bg-gray-50"
        >
          Get your free profile →
        </Link>
      </div>
    </footer>
  );
}
