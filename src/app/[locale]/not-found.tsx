import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-8xl font-bold text-sky-brand">404</h1>
      <p className="mt-4 text-xl text-brown/70">
        Page not found / 页面未找到
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 bg-sky-brand text-white px-6 py-3 rounded-full font-medium hover:bg-sky-brand-dark transition-colors"
      >
        Back to Home / 返回首页
      </Link>
    </div>
  );
}
