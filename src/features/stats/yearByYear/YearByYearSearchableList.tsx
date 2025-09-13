import React, { useCallback, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { GridColDef } from '@mui/x-data-grid';
import { formatNumberAsCurrency } from '../../../utils/textUtils.ts';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Search } from '@mui/icons-material';
import Grid from '@mui/material/Grid';
import { useTranslation } from 'react-i18next';
import MyFinStaticTable from '../../../components/MyFinStaticTable.tsx';
import { Box } from '@mui/material';

type Props = {
  list: YearByYearSearchableListItem[];
  isLoading: boolean;
};

export type YearByYearSearchableListItem = {
  name: string;
  amount: number;
};

const YearByYearSearchableList = (props: Props) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useMemo(() => debounce(setSearchQuery, 300), []);
  const filteredList = useMemo(() => {
    return props.list
      .filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
  }, [props.list, searchQuery]);

  const rows = filteredList.map((item) => ({
    id: item.name + item.amount,
    name: item.name,
    amount: item.amount,
  }));

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('investments.name'),
      minWidth: 50,
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (params) => `${params.value}`,
    },
    {
      field: 'amount',
      headerName: t('common.amount'),
      minWidth: 100,
      editable: false,
      sortable: false,
      align: 'right',
      renderCell: (params) => (
        <Box mt={2} mb={2}>
          {formatNumberAsCurrency(params.value)}
        </Box>
      ),
    },
  ];

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearchQuery(event.target.value);
    },
    [debouncedSearchQuery],
  );

  return (
    <Grid container>
      <Grid
        sx={{ display: 'flex', justifyContent: 'flex-end' }}
        size={{
          xs: 12,
          md: 6,
        }}
        offset="auto"
      >
        <TextField
          id="search"
          label={t('common.search')}
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search />
              </InputAdornment>
            ),
          }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            handleSearchChange(event);
          }}
        />
      </Grid>
      <Grid mt={2} size={12}>
        <MyFinStaticTable
          isRefetching={props.isLoading}
          rows={rows}
          columns={columns}
          paginationModel={{ pageSize: 5 }}
        />
      </Grid>
    </Grid>
  );
};

export default YearByYearSearchableList;
