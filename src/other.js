

function columnToLetter(column)
{
  var temp, letter = '';
  while (column > 0)
  {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

function letterToColumn(letter)
{
  var column = 0, length = letter.length;
  for (var i = 0; i < length; i++)
  {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }
  return column;
}

const separators = {
  es_AR: ';',
  hy_AM: ';',
  en_AU: ',',
  az_AZ: ';',
  be_BY: ';',
  es_BO: ';',
  pt_BR: ';',
  bg_BG: ';',
  en_CA: ',',
  fr_CA: ';',
  es_CL: ';',
  zh_CN: ',',
  es_CO: ';',
  hr_HR: ';',
  cs_CZ: ';',
  da_DK: ';',
  es_EC: ';',
  ar_EG: ',',
  fi_FI: ';',
  fr_FR: ';',
  ka_GE: ';',
  de_DE: ';',
  el_GR: ';',
  zh_HK: ',',
  hu_HU: ';',
  hi_IN: ',',
  bn_IN: ',',
  gu_IN: ',',
  kn_IN: ',',
  ml_IN: ',',
  mr_IN: ',',
  pa_IN: ',',
  ta_IN: ',',
  te_IN: ',',
  in_ID: ';',
  en_IE: ',',
  iw_IL: ',',
  it_IT: ';',
  ja_JP: ',',
  kk_KZ: ';',
  lv_LV: ';',
  lt_LT: ';',
  es_MX: ',',
  mn_MN: ',',
  my_MM: ',',
  nl_NL: ';',
  no_NO: ';',
  nn_NO: ';',
  es_PY: ';',
  fil_PH: ',',
  pl_PL: ';',
  pt_PT: ';',
  ro_RO: ';',
  ru_RU: ';',
  sr_RS: ';',
  sk_SK: ';',
  sl_SI: ';',
  ko_KR: ',',
  es_ES: ';',
  ca_ES: ';',
  sv_SE: ';',
  de_CH: ',',
  zh_TW: ',',
  th_TH: ',',
  tr_TR: ';',
  uk_UA: ';',
  en_GB: ',',
  cy_GB: ',',
  en_US: ',',
  es_UY: ';',
  es_VE: ';',
  vi_VN: ';'
}

function ssUrl() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getUrl();
}

function remove_oldids_from_cache() {
  let cache = CacheService.getScriptCache();
  cache.remove('oldids');
}

function deleteNRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('database');
  const rowStart = 5;
  const rowEnd = sheet.getLastRow();
  const n_rows = rowEnd - rowStart + 1;

  sheet.deleteRows(rowStart, n_rows);
  Logger.log(n_rows + ' rows deleted');
}




















































































