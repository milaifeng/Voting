"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import Image from "next/image";
import logo from "@/app/favicon.ico";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function ClientNavbar() {
  const pathname = usePathname();

  // 定义菜单项，便于维护和动态生成
  const menuItems = [
    { href: "/", label: "简介" },
    { href: "/create", label: "创建" },
    { href: "/polls", label: "提案" },
    { href: "/myVotes", label: "我的" },
    { href: "/rank", label: "排行" },
  ];
  return (
    <div className="flex fixed top-0  h-18 w-7xl z-10 justify-between p-4    bg-white border-b border-gray-100">
      <Image src={logo} alt="" width={40} height={40} />
      <div className="flex w-2xl justify-items-start ">
        {menuItems.map((item) => {
          const isActive = pathname === item.href; // 判断当前路径是否匹配
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full h-10 flex items-center justify-center py-2 transition-colors ${
                isActive
                  ? "text-sky-500 font-bold"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <ConnectButton />
    </div>
  );
}
