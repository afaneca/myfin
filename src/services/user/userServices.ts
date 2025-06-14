import { axios } from '../../data/axios.ts';

const getBackupData = () => {
  return axios.get<string>('/user/backup');
};

export default {
  getBackupData,
};
