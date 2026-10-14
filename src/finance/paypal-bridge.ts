/**
 * PayPal & Cashflow Bridge for Bravinall
 * 
 * Quản trị dòng tiền mặt: Điều hướng mọi thanh toán từ người dùng ứng dụng
 * Bravinall về trực tiếp tài khoản cá nhân của Phạm Việt Hà (vtvcab17@gmail.com).
 */

import * as fs from "fs";
import * as path from "path";

export interface PricingProduct {
  id: string;
  name: string;
  priceUSD: number;
  priceVND: number;
  description: string;
}

export const BRAVINALL_PRODUCTS: PricingProduct[] = [
  {
    id: "bravin-pro",
    name: "Bravin Video Editor - Bản quyền Trọn đời",
    priceUSD: 19.00,
    priceVND: 480000,
    description: "Mở khóa toàn bộ 35+ hiệu ứng, xuất video 4K không giới hạn, hỗ trợ keyframe và mask nâng cao."
  },
  {
    id: "antifact-pro",
    name: "Antifact Designer - Gói Nhà sáng tạo",
    priceUSD: 9.00,
    priceVND: 220000,
    description: "Công cụ xóa vật thể bằng AI, không giới hạn layer, xuất file PSD và vector chất lượng cao."
  },
  {
    id: "micron-plugin-bundle",
    name: "Micron AI Plugins - Gói Mở rộng",
    priceUSD: 15.00,
    priceVND: 380000,
    description: "Bao gồm Motion Tracking Pro, Canvas Node Flow và kết nối AI tự động hóa."
  },
  {
    id: "bravinall-all-access",
    name: "Bravinall All-Access Pass (Toàn bộ Hệ sinh thái)",
    priceUSD: 39.00,
    priceVND: 990000,
    description: "Sở hữu toàn bộ Bravin, Antifact, Micron và các bản cập nhật vĩnh viễn trong tương lai."
  }
];

export class PayPalBridge {
  private payeeEmail = "vtvcab17@gmail.com";
  private beneficiary = "Phạm Việt Hà";
  private dataDir = path.join(process.cwd(), "data");

  constructor() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Tạo mã nút PayPal Smart Button HTML nhúng trực tiếp vào website Bravinall
   */
  public generatePayPalButtonHtml(product: PricingProduct, clientId = "sb"): string {
    return `
<!-- Nút thanh toán PayPal cho ${product.name} -->
<div id="paypal-button-container-${product.id}"></div>
<script src="https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD"></script>
<script>
  paypal.Buttons({
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          description: "${product.name}",
          amount: {
            value: "${product.priceUSD.toFixed(2)}"
          },
          payee: {
            email_address: "${this.payeeEmail}"
          }
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        alert("Cảm ơn bạn! Thanh toán thành công cho: " + details.payer.name.given_name);
        // Chuyển hướng hoặc kích hoạt bản quyền ứng dụng
        window.location.href = "/kich-hoat?orderId=" + data.orderID;
      });
    }
  }).render('#paypal-button-container-${product.id}');
</script>
    `.trim();
  }

  /**
   * Tạo đoạn code nhúng thanh toán VietQR chuyển khoản trực tiếp ngân hàng Việt Nam
   */
  public generateVietQRUrl(bankCode: string, accountNumber: string, product: PricingProduct): string {
    const memo = encodeURIComponent(`BRAVINALL ${product.id.toUpperCase()}`);
    return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${product.priceVND}&addInfo=${memo}&accountName=${encodeURIComponent(this.beneficiary)}`;
  }

  /**
   * Xuất file hướng dẫn tích hợp thanh toán vào trang web Bravinall
   */
  public exportIntegrationGuide(): string {
    const guidePath = path.join(process.cwd(), "PAYMENT_INTEGRATION.md");
    let content = `# Hướng dẫn Tích hợp Thanh toán Tiền mặt cho Bravinall\n\n`;
    content += `**Người thụ hưởng:** ${this.beneficiary} (${this.payeeEmail})\n\n`;
    content += `Toàn bộ tiền mặt thanh toán từ khách hàng sử dụng dịch vụ trong hệ sinh thái Bravinall được điều chuyển trực tiếp về tài khoản của bạn qua 2 cổng chính:\n\n`;
    content += `### 1. Cổng Quốc tế: PayPal Checkout\n`;
    content += `- **Tài khoản nhận tiền:** \`${this.payeeEmail}\`\n`;
    content += `- Tiền vào tài khoản PayPal USD của bạn, có thể rút thẳng về thẻ Visa/Mastercard hoặc tài khoản ngân hàng tại Việt Nam.\n\n`;
    content += `### 2. Cổng Nội địa: Chuyển khoản VietQR tự động\n`;
    content += `- Tiền mặt VND vào trực tiếp số tài khoản ngân hàng của Phạm Việt Hà.\n\n`;
    content += `### Bảng giá niêm yết các sản phẩm:\n\n`;

    for (const prod of BRAVINALL_PRODUCTS) {
      content += `#### 📦 ${prod.name} (\`${prod.id}\`)\n`;
      content += `- **Giá quốc tế:** $${prod.priceUSD.toFixed(2)} USD\n`;
      content += `- **Giá Việt Nam:** ${prod.priceVND.toLocaleString("vi-VN")} VNĐ\n`;
      content += `- **Mô tả:** ${prod.description}\n\n`;
    }

    fs.writeFileSync(guidePath, content, "utf-8");
    return guidePath;
  }
}

import { fileURLToPath } from "url";

const isDirectRun = Boolean(process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url)));

if (isDirectRun) {
  const bridge = new PayPalBridge();
  const file = bridge.exportIntegrationGuide();
  console.log(`✅ Đã xuất cấu hình thanh toán tiền mặt về: ${file}`);
}

