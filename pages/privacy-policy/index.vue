<template>
  <view class="privacy-container">
    <view class="privacy-header">
      <view class="header-top">
        <view class="back-btn-wrapper" @tap="goBack">
          <uni-icons type="left" size="28" color="#FFFFFF"></uni-icons>
        </view>
        <text class="header-title">隐私政策</text>
        <view class="placeholder"></view>
      </view>
    </view>

    <scroll-view class="privacy-content" scroll-y="true">
      <view class="content-inner">
        <view class="intro-section">
          <text class="intro-text">时光账记（以下简称"我们"）非常重视您的隐私保护。本隐私政策旨在帮助您了解我们如何收集、使用、存储和保护您的个人信息。</text>
        </view>

        <view v-for="section in privacyData.sections" :key="section.id" class="section">
          <text class="section-title">{{ section.title }}</text>
          <view v-for="(paragraph, idx) in section.paragraphs" :key="idx" class="paragraph-wrapper">
            <text v-if="!paragraph.items" class="section-text">{{ paragraph.text }}</text>
            <view v-else class="list-items">
              <text v-for="(item, itemIdx) in paragraph.items" :key="itemIdx" class="list-item">{{ item }}</text>
            </view>
          </view>
        </view>

        <view class="section-footer">
          <text class="footer-text">更新日期：{{ privacyData.updateTime }}</text>
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
      privacyData: {
        updateTime: '2026年01月22日',
        sections: [
          {
            id: 1,
            title: '1. 我们收集的信息',
            paragraphs: [
              {
                text: '为了向您提供服务，我们会收集以下类型的信息：'
              },
              {
                items: [
                  '• 账号信息：您通过微信授权登录时，我们会收集您的微信昵称、头像等公开信息，用于建立您的用户档案。',
                  '• 账单数据：您主动输入的账单记录、分类、备注等信息。',
                  '• 设备信息：我们会收集您的设备型号、操作系统版本等信息，用于优化应用适配和解决技术问题。'
                ]
              }
            ]
          },
          {
            id: 2,
            title: '2. 信息的用途',
            paragraphs: [
              {
                text: '我们收集的信息将用于以下目的：'
              },
              {
                items: [
                  '• 提供核心记账服务：存储和展示您的账单数据；',
                  '• 统计分析：为您生成收支报表和消费趋势分析；',
                  '• 产品优化：分析使用情况以改进产品功能和体验；',
                  '• 安全保障：检测和防止欺诈、滥用等非法活动。'
                ]
              }
            ]
          },
          {
            id: 3,
            title: '3. 信息共享与披露',
            paragraphs: [
              {
                text: '我们承诺不会向任何第三方出售您的个人信息。我们仅在以下情况共享您的信息：'
              },
              {
                items: [
                  '• 获得您的明确同意；',
                  '• 法律法规规定或司法机关要求；',
                  '• 为了保护我们的合法权益或用户的安全。'
                ]
              }
            ]
          },
          {
            id: 4,
            title: '4. 信息存储与安全',
            paragraphs: [
              {
                text: '4.1 存储地点：您的信息将存储在中国境内的服务器上。'
              },
              {
                text: '4.2 安全措施：我们采用业界标准的安全技术（如SSL加密传输）和管理制度来保护您的信息安全，防止未经授权的访问、使用或泄露。'
              }
            ]
          },
          {
            id: 5,
            title: '5. 您的权利',
            paragraphs: [
              {
                text: '根据相关法律法规，您拥有以下权利：'
              },
              {
                items: [
                  '• 访问权：您可以在应用内随时查看您的账单数据；',
                  '• 更正权：您可以随时修改您的账单记录；',
                  '• 删除权：您可以联系我们申请注销账号并删除您的全部数据。'
                ]
              }
            ]
          },
          {
            id: 6,
            title: '6. 未成年人保护',
            paragraphs: [
              {
                text: '我们非常重视未成年人的隐私保护。若您是未成年人，建议您在监护人的指导下使用本应用。'
              }
            ]
          },
          {
            id: 7,
            title: '7. 隐私政策更新',
            paragraphs: [
              {
                text: '我们会根据业务发展和法律法规变化更新本隐私政策。更新后的政策将在应用内发布。您继续使用本应用即表示同意更新后的隐私政策。'
              }
            ]
          },
          {
            id: 8,
            title: '8. 联系我们',
            paragraphs: [
              {
                text: '如您对本隐私政策有任何疑问或投诉，请通过以下方式联系我们：'
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
.privacy-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #F5F7FA;
}

.privacy-header {
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
  margin-left: -20rpx;
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

.privacy-content {
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