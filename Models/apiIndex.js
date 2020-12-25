const axios = require('axios');

async function getCollege(city, state, schoolType) {
  const apikey = process.env.college_API_KEY

  let whereStr = ''

  if (schoolType === 'public') { whereStr = '&school.ownership=1' }
  else if (schoolType.includes('private') && schoolType.includes('nonprofit')) { whereStr = '&school.ownership=2' }
  else if (schoolType.includes('private') && (schoolType.includes('for-profit') || schoolType.includes('for profit'))) { whereStr = '&school.ownership=3' }
  else { whereStr = '' }

  whereStr = `api_key=${apikey}&school.city=${city}&school.state=${state}${whereStr}`

  const apiUrl = `https://api.data.gov/ed/collegescorecard/v1/schools?${whereStr}&fields=id,ope6_id,ope8_id,school.name,2013.student.size,school.zip,school.city,school.state,school.ownership`

  console.log({ apiUrl })
  const response = await axios.get(apiUrl);

  return await response.data.results;
}

module.exports = {
  getCollege
}
