import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="py-20 px-6 text-center w-full bg-linear-to-r from-blue-500 to-purple-600 text-white">
      <h1 className="text-5xl font-bold mb-4">去中心化投票平台</h1>
      <p className="text-xl mb-8">
        公平、透明、社区驱动。使用区块链创建和参与投票，支持多链。
      </p>
      <div className="flex justify-center gap-6">
        <Link
          href="/create"
          className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition"
        >
          立即创建投票
        </Link>
        <Link
          href="/polls"
          className="border-2 border-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition"
        >
          浏览提案
        </Link>
      </div>
      <div className="mt-12">
        {/* 简单动画图标（用 SVG 或 Lottie） */}
        <svg
          className="w-32 h-32 mx-auto animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </section>
  );
}
