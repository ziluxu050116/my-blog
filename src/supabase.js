import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://bgrrksyidkttuyfalbls.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncnJrc3lpZGt0dHV5ZmFsYmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3Mzk2NzQsImV4cCI6MjA3ODMxNTY3NH0.70isz5zAs-6ja__jsl7KqCrLjfRXrM-AYd_XGsYhNlA"
// 只保留一个 supabase 实例，添加请求头配置
export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      Accept: 'application/json', // 强制指定响应格式为 JSON
    },
  },
})