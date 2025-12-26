<template>
  <view class="page-container">
    <view class="placeholder-content">
      <text class="page-title">记账</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: $background-color;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  
  .page-title {
    font-size: 48rpx;
    font-weight: 600;
    color: $text-primary;
  }
}
</style>
