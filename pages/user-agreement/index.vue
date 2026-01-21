<template>
  <view class="agreement-container">
    <view class="agreement-header">
      <view class="header-top">
        <view class="back-btn-wrapper" @tap="goBack">
          <uni-icons type="left" size="28" color="#FFFFFF"></uni-icons>
        </view>
        <text class="header-title">用户协议</text>
        <view class="placeholder"></view>
      </view>
    </view>

    <scroll-view class="agreement-content" scroll-y="true">
      <view class="content-inner">
        <view class="intro-section">
          <text class="intro-text">感谢您选择时光账记。在使用本应用前，请您仔细阅读以下协议内容。使用本应用即表示您同意遵守以下条款。</text>
        </view>

        <view v-for="section in agreementData.sections" :key="section.id" class="section">
          <text class="section-title">{{ section.title }}</text>
          <view v-for="(paragraph, idx) in section.paragraphs" :key="idx" class="paragraph-wrapper">
            <text v-if="!paragraph.items" class="section-text">{{ paragraph.text }}</text>
            <view v-else class="list-items">
              <text v-for="(item, itemIdx) in paragraph.items" :key="itemIdx" class="list-item">{{ item }}</text>
            </view>
          </view>
        </view>

        <view class="section-footer">
          <text class="footer-text">生效日期：{{ agreementData.updateTime }}</text>
          <text class="copyright">Copyright © 2024 Momento. All Rights Reserved.</text>
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
        updateTime: '2026年01月22日',
        sections: [
          {
            id: 1,
            title: '1. 服务条款确认与接纳',
            paragraphs: [
              {
                text: '时光账记（以下简称"本应用"）是由开发者提供的个人记账与数据管理服务。本协议是用户（以下简称"您"）与本应用之间关于使用本服务所订立的协议。'
              },
              {
                text: '当您点击"登录"或实际使用本应用服务时，即视为您已阅读并同意接受本协议的所有条款。如果您不同意本协议的任何内容，请立即停止使用本应用。'
              }
            ]
          },
          {
            id: 2,
            title: '2. 账号与安全',
            paragraphs: [
              {
                text: '2.1 账号注册：您需要通过微信授权登录使用本应用。您承诺在注册和使用账号时提供真实、准确、合法的个人资料。'
              },
              {
                text: '2.2 账号安全：您应妥善保管您的账号信息。因您个人原因导致的账号泄露或丢失，由您自行承担责任。如发现账号存在安全隐患，请立即联系我们。'
              }
            ]
          },
          {
            id: 3,
            title: '3. 用户行为规范',
            paragraphs: [
              {
                text: '您在使用本应用过程中，应遵守法律法规及本协议规定，不得从事以下行为：'
              },
              {
                items: [
                  '• 发布、传送、传播违反国家法律法规、社会公德的信息；',
                  '• 侵犯他人知识产权、名誉权、隐私权等合法权益；',
                  '• 利用本应用从事洗钱、诈骗等非法活动；',
                  '• 干扰本应用的正常运行，进行反向工程、反向编译等破坏行为。'
                ]
              }
            ]
          },
          {
            id: 4,
            title: '4. 数据所有权与使用',
            paragraphs: [
              {
                text: '4.1 数据归属：您在本应用中记录的账单、备注等数据归您所有。本应用仅提供存储和管理服务。'
              },
              {
                text: '4.2 数据使用：为了向您提供统计分析等服务，您授权本应用对您的数据进行必要的处理。我们将严格保护您的隐私，不会向第三方出售您的个人数据。'
              }
            ]
          },
          {
            id: 5,
            title: '5. 免责声明',
            paragraphs: [
              {
                text: '5.1 本应用按"现状"提供服务，不保证服务一定满足您的特定需求，也不保证服务不会中断。'
              },
              {
                text: '5.2 对于因不可抗力、网络状况、通讯线路等非本应用过错导致的服务中断或数据丢失，本应用不承担法律责任，但会尽可能减少因此给您造成的损失。'
              }
            ]
          },
          {
            id: 6,
            title: '6. 协议修改与终止',
            paragraphs: [
              {
                text: '6.1 本应用有权根据法律法规变化或业务发展需要修改本协议。修改后的协议将在应用内公布，不再单独通知。'
              },
              {
                text: '6.2 如您不同意修改后的协议，有权停止使用本服务。继续使用即视为接受修改后的协议。'
              }
            ]
          },
          {
            id: 7,
            title: '7. 法律适用与争议解决',
            paragraphs: [
              {
                text: '本协议的订立、执行和解释及争议的解决均应适用中华人民共和国法律。如双方就本协议内容或其执行发生任何争议，双方应友好协商解决；协商不成时，应提交本应用所在地人民法院管辖。'
              }
            ]
          },
          {
            id: 8,
            title: '8. 联系我们',
            paragraphs: [
              {
                text: '如您对本协议有任何疑问或建议，请通过以下方式联系我们：'
              },
              {
                items: [
                  '微信号：1414818093'
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
  background: #F5F7FA;
}

.agreement-header {
  background: linear-gradient(135deg, #FF9A5A 0%, #FFD166 100%);
  padding: calc(60rpx + env(safe-area-inset-top)) 40rpx 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 154, 90, 0.2);
  position: relative;
  z-index: 10;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
}

.back-btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 88rpx;
  height: 88rpx;
  margin-left: -20rpx; /* Adjust click area visual alignment */
  padding-left: 20rpx;
  
  &:active {
    opacity: 0.7;
  }
}

.placeholder {
  width: 88rpx;
}

.header-title {
  font-size: 36rpx;
  color: #FFFFFF;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.agreement-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.content-inner {
  padding: 40rpx;
  padding-bottom: calc(60rpx + env(safe-area-inset-bottom));
}

.intro-section {
  margin-bottom: 50rpx;
  padding: 30rpx;
  background: rgba(255, 154, 90, 0.08);
  border-radius: 16rpx;
  border-left: 8rpx solid #FF9A5A;
}

.intro-text {
  font-size: 28rpx;
  color: #555;
  line-height: 1.6;
  text-align: justify;
}

.section {
  margin-bottom: 50rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 24rpx;
  position: relative;
  padding-left: 24rpx;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8rpx;
    height: 32rpx;
    background: linear-gradient(to bottom, #FF9A5A, #FFD166);
    border-radius: 4rpx;
  }
}

.paragraph-wrapper {
  margin-bottom: 16rpx;
}

.section-text {
  display: block;
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  text-align: justify;
}

.list-items {
  display: flex;
  flex-direction: column;
  margin-top: 10rpx;
  padding-left: 10rpx;
  background: #fff;
  padding: 20rpx;
  border-radius: 12rpx;
}

.list-item {
  display: block;
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  margin-bottom: 10rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-footer {
  text-align: center;
  padding-top: 60rpx;
  border-top: 2rpx dashed #E0E0E0;
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.footer-text {
  font-size: 24rpx;
  color: #999;
}

.copyright {
  font-size: 20rpx;
  color: #CCC;
}
</style>