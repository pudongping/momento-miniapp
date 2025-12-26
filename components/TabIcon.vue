<template>
  <view class="tab-icon-container">
    <uni-icons :type="type" :color="color" size="24"></uni-icons>
  </view>
</template>

<script>
export default {
  name: 'TabIcon',
  props: {
    type: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: '#666666'
    }
  }
}
</script>

<style>
.tab-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
