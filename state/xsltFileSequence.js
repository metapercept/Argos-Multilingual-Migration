const executionSequence = [
  "./xslt/1_FM_Topic_sequnce.xsl",
  "./xslt/2_Topic_Nesting_setting.xsl",
  "./xslt/3_Nested_Content_moved.xsl",
  "./xslt/3-1_Nested_Content_moved.xsl",
  "./xslt/4_LIST_manage.xsl",
  "./xslt/4-1_UL_LIST_manage.xsl",
  "./xslt/5_FM_List_sequence.xsl",
];

function getXSLTFileSequence() {
  return executionSequence;
}

module.exports = { getXSLTFileSequence };
