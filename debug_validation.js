// 调试验证逻辑
function testValidation() {
  const num = 25.375;
  const multiplied = num / 0.25;
  const remainder = Math.abs(num) % 0.25;

  console.log('测试值:', num);
  console.log('除以0.25:', multiplied);
  console.log('四舍五入:', Math.round(multiplied));
  console.log('差值:', Math.abs(multiplied - Math.round(multiplied)));
  console.log('余数方法:', remainder);
  console.log('是否有效:', Math.abs(multiplied - Math.round(multiplied)) <= 0.001);

  // 测试168.125
  const num2 = 168.125;
  const multiplied2 = num2 / 0.25;
  const remainder2 = Math.abs(num2) % 0.25;

  console.log('\n测试值2:', num2);
  console.log('除以0.25:', multiplied2);
  console.log('四舍五入:', Math.round(multiplied2));
  console.log('差值:', Math.abs(multiplied2 - Math.round(multiplied2)));
  console.log('余数方法:', remainder2);
  console.log('是否有效:', Math.abs(multiplied2 - Math.round(multiplied2)) <= 0.001);
}

testValidation();