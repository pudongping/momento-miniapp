<template>
  <view class="agreement-container">
    <view class="agreement-header">
      <view class="header-top">
        <text class="back-btn" @tap="goBack">← 返回</text>
        <text class="header-title">用户协议</text>
        <view style="width: 60rpx;"></view>
      </view>
    </view>

    <scroll-view class="agreement-content" scroll-y="true">
      <view class="content-inner">
        <view v-for="section in agreementData.sections" :key="section.id" class="section">
          <text class="section-title">{{ section.title }}</text>
          <view v-for="(paragraph, idx) in section.paragraphs" :key="idx">
            <text v-if="!paragraph.items" class="section-text">{{ paragraph.text }}</text>
            <view v-else class="list-items">
              <text v-for="(item, itemIdx) in paragraph.items" :key="itemIdx" class="list-item">{{ item }}</text>
            </view>
          </view>
        </view>

        <view class="section-footer">
          <text class="footer-text">最后更新时间：{{ agreementData.updateTime }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      agreementData: {
        updateTime: '2024年12月29日',
        sections: [
          {
            id: 1,
            title: '1. 服务条款',
            paragraphs: [
              {
                text: '欢迎使用时光小账本小程序（以下简称"本应用"）。本应用由开发者提供，旨在帮助用户记录和管理个人账单信息。'
              },
              {
                text: '用户在使用本应用前，应仔细阅读本协议的全部内容。如果用户不同意本协议的任何条款，请不要使用本应用。用户使用本应用，即表示用户已接受本协议的全部条款。'
              }
            ]
          },
          {
            id: 2,
            title: '2. 用户账户',
            paragraphs: [
              {
                text: '用户需要通过微信授权登录来使用本应用的全部功能。用户应对其账户下的所有活动负责。'
              },
              {
                text: '用户不得将其账户转让、出售或以其他方式转移给他人。用户应妥善保管其账户信息，不得向他人泄露。'
              }
            ]
          },
          {
            id: 3,
            title: '3. 用户内容',
            paragraphs: [
              {
                text: '用户在本应用中输入的所有账单信息、备注等内容（以下简称"用户内容"）均为用户的个人数据。'
              },
              {
                text: '用户保留对其用户内容的所有权利。用户授予本应用使用、存储和处理用户内容的权利，以便为用户提供服务。'
              }
            ]
          },
          {
            id: 4,
            title: '4. 知识产权',
            paragraphs: [
              {
                text: '本应用的所有内容，包括但不限于文本、图形、标志、图标、图像、声音、代码等，均受著作权、商标权等法律保护。'
              },
              {
                text: '用户不得复制、修改、分发、传输或以其他方式使用本应用的内容，除非获得明确的书面许可。'
              }
            ]
          },
          {
            id: 5,
            title: '5. 免责声明',
            paragraphs: [
              {
                text: '本应用按"现状"提供，不提供任何明示或暗示的保证。开发者不保证本应用的准确性、完整性或适用性。'
              },
              {
                text: '用户使用本应用产生的任何损失或损害，开发者不承担责任。用户应自行承担使用本应用的所有风险。'
              }
            ]
          },
          {
            id: 6,
            title: '6. 服务中断',
            paragraphs: [
              {
                text: '开发者保留随时中断、修改或终止本应用服务的权利，无需事先通知用户。'
              },
              {
                text: '在服务中断期间，用户可能无法访问其账户或数据。开发者不对因服务中断而产生的任何损失负责。'
              }
            ]
          },
          {
            id: 7,
            title: '7. 用户行为规范',
            paragraphs: [
              {
                text: '用户承诺不会在本应用中从事以下行为：'
              },
              {
                items: [
                  '• 违反任何适用的法律、法规或政策',
                  '• 侵犯他人的知识产权或其他权利',
                  '• 发送垃圾信息、骚扰或威胁他人',
                  '• 尝试获取未授权的访问权限',
                  '• 进行任何可能损害本应用的行为'
                ]
              }
            ]
          },
          {
            id: 8,
            title: '8. 协议修改',
            paragraphs: [
              {
                text: '开发者保留随时修改本协议的权利。修改后的协议将在本应用中发布。用户继续使用本应用，即表示接受修改后的协议。'
              }
            ]
          },
          {
            id: 9,
            title: '9. 法律适用',
            paragraphs: [
              {
                text: '本协议受中华人民共和国法律管辖。因本协议引起的任何争议，应通过友好协商解决。协商不成的，提交至有管辖权的人民法院处理。'
              }
            ]
          },
          {
            id: 10,
            title: '10. 联系方式',
            paragraphs: [
              {
                text: '如对本协议有任何疑问或建议，请通过以下方式联系我们：'
              },
              {
                items: [
                  '邮箱：support@momento.com',
                  '微信：时光小账本官方客服'
                ]
              }
            ]
          }
        ]
      }
    };
  },
  
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.agreement-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #FAFAFA;
}

.agreement-header {
  background: linear-gradient(135deg, #FF9A5A 0%, #FFD166 100%);
  padding: calc(60rpx + env(safe-area-inset-top)) 40rpx 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100rpx;
  min-height: 100rpx;
}

.back-btn {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
  padding: 8rpx 12rpx;
}

.header-title {
  font-size: 36rpx;
  color: #FFFFFF;
  font-weight: 700;
  letter-spacing: 1rpx;
  margin-top: 20rpx;
}

.agreement-content {
  flex: 1;
  overflow-y: auto;
}

.content-inner {
  padding: 40rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.section {
  margin-bottom: 40rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #2C3E50;
  margin-bottom: 16rpx;
  letter-spacing: 0.5rpx;
}

.section-text {
  display: block;
  font-size: 28rpx;
  color: #666666;
  line-height: 1.8;
  margin-bottom: 12rpx;
  letter-spacing: 0.3rpx;
}

.list-items {
  display: flex;
  flex-direction: column;
  margin-bottom: 12rpx;
}

.list-item {
  display: block;
  font-size: 28rpx;
  color: #666666;
  line-height: 1.8;
  margin-bottom: 8rpx;
  letter-spacing: 0.3rpx;
}

.section-footer {
  text-align: center;
  padding-top: 40rpx;
  border-top: 1rpx solid #E5E5E5;
  margin-top: 60rpx;
}

.footer-text {
  font-size: 24rpx;
  color: #999999;
  font-weight: 400;
}
</style>
