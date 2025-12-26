/**
 * 统一管理Mock数据
 * 所有的时间戳均为秒级时间戳，避免前端精度问题
 * 约定：仅用户 uid 为雪花算法分布式 ID（字符串）；其他业务主键为 int 自增 ID
 */
import { wxLogin, getUserInfo, updateUserInfo, bindPhone } from './user.js';
import { getBudget, updateBudget } from './budget.js';
import { getFestivals, addFestival, updateFestival, deleteFestival, toggleFestivalVisibility } from './festivals.js';

// 统一返回格式
function success(data = null) {
  return {
    code: 0,
    msg: '成功',
    data
  };
}

function error(msg = '操作失败', code = 1) {
  return {
    code,
    msg,
    data: null
  };
}

// Mock API配置
export const mockApis = {
  // 用户相关接口
  '/user/login': (options) => {
    const { code } = options.data;
    if (!code) {
      return error('登录失败：缺少code参数');
    }
    return success(wxLogin(code));
  },
  '/user/info': () => {
    return success(getUserInfo());
  },
  '/user/update': (options) => {
    const data = options.data;
    return success(updateUserInfo(data));
  },
  '/user/bind-phone': (options) => {
    const { phone, code } = options.data;
    if (!phone || !code) {
      return error('绑定失败：参数不完整');
    }
    return success(bindPhone({ phone, code }));
  },

  // 预算相关接口
  '/budget': (options) => {
    if (options.method === 'GET') {
      return success(getBudget());
    } else if (options.method === 'PUT') {
      const { budget } = options.data;
      if (budget === undefined) {
        return error('更新失败：缺少budget参数');
      }
      return success(updateBudget(budget));
    }
    return error('不支持的请求方法');
  },

  // 节日相关接口
  '/festivals/list': () => {
    return success(getFestivals());
  },
  '/festivals/add': (options) => {
    const { festival_name, festival_date, is_show_home } = options.data;
    if (!festival_name || !festival_date) {
      return error('添加失败：参数不完整');
    }
    return success(addFestival({ festival_name, festival_date, is_show_home }));
  },
  '/festivals/update': (options) => {
    const { festival_id, festival_name, festival_date, is_show_home } = options.data;
    if (!festival_id || !festival_name || !festival_date) {
      return error('更新失败：参数不完整');
    }
    return success(updateFestival({ festival_id, festival_name, festival_date, is_show_home }));
  },
  '/festivals/delete': (options) => {
    const { festival_id } = options.data;
    if (!festival_id) {
      return error('删除失败：缺少id参数');
    }
    return success(deleteFestival(festival_id));
  },
  '/festivals/toggle': (options) => {
    const { festival_id, is_show_home } = options.data;
    if (!festival_id || is_show_home === undefined) {
      return error('操作失败：参数不完整');
    }
    return success(toggleFestivalVisibility({ festival_id, is_show_home }));
  }
};
