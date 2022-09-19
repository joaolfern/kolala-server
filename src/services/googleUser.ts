import axios from 'axios'
import { IGoogleUser } from '../types/auth'

export async function getGoogleUser (accessToken: string) {
  try {
    const userInfoResponse = await axios.get<IGoogleUser>(
      'https://openidconnect.googleapis.com/v1/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    const data = userInfoResponse.data

    return data
  } catch (err) {
    console.log(err)
  }
}