export default function WalletPrompt() {
  return (
    <section className="py-12 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">立即连接钱包，开始投票！</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          支持 MetaMask、WalletConnect 等，无 Gas 门槛。
        </p>
        <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-gray-500">
          <div>✅ 公平透明</div>
          <div>🔒 区块链存储</div>
          <div>🚀 多链支持</div>
        </div>
      </div>
    </section>
  );
}
