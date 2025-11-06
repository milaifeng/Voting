"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import Image from "next/image";
import logo from "@/app/favicon.ico";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wrench, ListTree, User, UsersRound } from "lucide-react";
export default function ClientNavbar() {
  const pathname = usePathname();

  // 定义菜单项，便于维护和动态生成
  const menuItems = [
    { href: "/", label: "首页", icon: Home },
    { href: "/create", label: "创建", icon: Wrench },
    { href: "/polls", label: "提案", icon: ListTree },
    { href: "/myVotes", label: "我的", icon: User },
    { href: "/rank", label: "排行", icon: UsersRound },
  ];
  return (
    <div className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-3">
        {/* 左侧 logo */}
        <div className="flex items-center gap-2">
          <Image src={logo} alt="logo" width={40} height={40} />
        </div>

        {/* 中间菜单（响应式隐藏） */}
        <div className="hidden md:flex items-center gap-10">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center transition-colors ${
                  isActive
                    ? "text-sky-500 font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <item.icon className="w-5 h-5 mr-1" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* 右侧连接按钮 */}
        <ConnectButton />
      </div>

      {/* 移动端底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around md:hidden py-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center text-xs ${
                isActive ? "text-sky-500" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
