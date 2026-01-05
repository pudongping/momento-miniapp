// 文件上传相关的 Mock 数据

export default {
  // 上传文件
  'POST /upload/file': (req) => {
    const { file_type, business_type } = req;
    
    // 模拟文件上传成功
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileExtension = file_type === 'image' ? 'jpg' : 'xlsx';
    
    return {
      code: 200,
      message: '上传成功',
      data: {
        // 文件服务器相对路径
        relative_path: `/uploads/${business_type}/${timestamp}_${randomStr}.${fileExtension}`,
        // 文件访问的链接地址绝对路径
        absolute_url: `https://cdn.example.com/uploads/${business_type}/${timestamp}_${randomStr}.${fileExtension}`,
        file_size: 1024 * 100, // 100KB
        file_type: file_type,
        business_type: business_type,
        upload_time: Math.floor(Date.now() / 1000),
        user_id: '123456789012345678', // 字符串类型
        file_id: `${timestamp}_${randomStr}`,
      }
    };
  }
};
