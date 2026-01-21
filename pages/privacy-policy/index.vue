<template>
  <view class="privacy-container">
    <view class="privacy-header">
      <view class="header-top">
        <view class="back-btn-wrapper" @tap="goBack">
          <uni-icons type="left" size="24" color="#FFFFFF"></uni-icons>
        </view>
        <text class="header-title">隐私政策</text>
        <view class="placeholder"></view>
      </view>
    </view>

    <scroll-view class="privacy-content" scroll-y="true">
      <view class="content-inner">
        <view v-for="section in privacyData.sections" :key="section.id" class="section">
          <text class="section-title">{{ section.title }}</text>
          <view v-for="(paragraph, idx) in section.paragraphs" :key="idx">
            <text v-if="!paragraph.items" class="section-text">{{ paragraph.text }}</text>
            <view v-else class="list-items">
              <text v-for="(item, itemIdx) in paragraph.items" :key="itemIdx" class="list-item">{{ item }}</text>
            </view>
          </view>
        </view>


        <view class="section-footer">
          <text class="footer-text">最后更新时间：{{ privacyData.updateTime }}</text>
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
        updateTime: '2024年12月29日',
        sections: [
          {
            id: 1,
            title: '1. 信息收集',
            paragraphs: [
              {
                text: '本应用通过微信授权登录收集以下信息：'
              },
              {
                items: [
                  '• 微信用户基本信息（昵称、头像）',
                  '• 用户在本应用中输入的账单信息和交易记录',
                ]
              }
            ]
          },
          {
            id: 2,
            title: '2. 信息使用',
            paragraphs: [
              {
                text: '我们收集的信息仅用于以下目的：'
              },
              {
                items: [
                  '• 提供和改进本应用的服务',
                  '• 个性化用户体验',
                  '• 分析应用使用情况和性能',
                  '• 解决技术问题和提供客户支持',
                  '• 遵守法律和监管要求'
                ]
              },
              {
                text: '我们不会将您的个人信息用于上述目的以外的任何目的，除非获得您的明确同意。'
              }
            ]
          },
          {
            id: 3,
            title: '3. 信息存储和安全',
            paragraphs: [
              {
                text: '我们采取适当的技术和组织措施来保护您的个人信息，包括：'
              },
              {
                items: [
                  '• 使用加密技术保护数据传输',
                  '• 限制对个人信息的访问权限',
                  '• 定期进行安全审计和评估',
                  '• 制定和执行数据安全政策'
                ]
              },
              {
                text: '尽管我们尽力保护您的信息，但没有任何系统是完全安全的。如果您发现任何安全问题，请立即联系我们。'
              }
            ]
          },
          {
            id: 4,
            title: '4. 信息共享',
            paragraphs: [
              {
                text: '我们不会与第三方共享您的个人信息，除非：'
              },
              {
                items: [
                  '• 获得您的明确同意',
                  '• 法律或监管要求',
                  '• 保护我们的权利、隐私、安全或财产',
                  '• 与服务提供商合作（这些提供商受保密协议约束）'
                ]
              }
            ]
          },
          {
            id: 5,
            title: '5. Cookie和追踪技术',
            paragraphs: [
              {
                text: '本应用可能使用Cookie和类似的追踪技术来增强用户体验。您可以通过浏览器设置来控制Cookie的使用。'
              },
              {
                text: '我们不会使用追踪技术来识别您的身份或跟踪您在其他网站上的活动。'
              }
            ]
          },
          {
            id: 6,
            title: '6. 第三方链接',
            paragraphs: [
              {
                text: '本应用可能包含指向第三方网站或服务的链接。我们对第三方的隐私政策和做法不负责。'
              },
              {
                text: '在访问第三方网站前，请查看其隐私政策。'
              }
            ]
          },
          {
            id: 7,
            title: '7. 儿童隐私',
            paragraphs: [
              {
                text: '本应用不面向13岁以下的儿童。我们不会故意收集13岁以下儿童的个人信息。'
              },
              {
                text: '如果我们发现收集了儿童的个人信息，我们将立即删除这些信息。'
              }
            ]
          },
          {
            id: 8,
            title: '8. 您的权利',
            paragraphs: [
              {
                text: '根据适用的法律，您可能有权：'
              },
              {
                items: [
                  '• 访问和获取您的个人信息副本',
                  '• 更正或更新您的个人信息',
                  '• 删除您的个人信息',
                  '• 限制或反对我们对您信息的处理',
                  '• 撤回同意'
                ]
              },
              {
                text: '如需行使这些权利，请联系我们。'
              }
            ]
          },
          {
            id: 9,
            title: '9. 数据保留',
            paragraphs: [
              {
                text: '我们将保留您的个人信息，只要您使用本应用或根据法律要求。'
              },
              {
                text: '当您删除账户时，我们将删除或匿名化您的个人信息，除非法律要求我们保留。'
              }
            ]
          },
          {
            id: 10,
            title: '10. 国际数据传输',
            paragraphs: [
              {
                text: '您的个人信息可能被传输到、存储在或处理于中国境内的服务器上。'
              },
              {
                text: '通过使用本应用，您同意您的信息可能被传输到中国。'
              }
            ]
          },
          {
            id: 11,
            title: '11. 政策变更',
            paragraphs: [
              {
                text: '我们可能随时更新本隐私政策。更新后的政策将在本应用中发布，并标注更新日期。'
              },
              {
                text: '继续使用本应用表示您接受更新后的隐私政策。'
              }
            ]
          },
          {
            id: 12,
            title: '12. 联系我们',
            paragraphs: [
              {
                text: '如对本隐私政策有任何疑问或关于您的个人信息的请求，请通过以下方式联系我们：'
              },
              {
                items: [
                  '微信：1414818093',
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
  background: #FAFAFA;
}

.privacy-header {
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

.back-btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  margin-left: -20rpx;
  
  &:active {
    background: rgba(255, 255, 255, 0.3);
  }
}

.placeholder {
  width: 80rpx;
}

.header-title {
  font-size: 34rpx;
  color: #FFFFFF;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.privacy-content {
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
