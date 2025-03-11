const executionSequence = [
  "./xslt/1_FM_cleanup-1.xsl",
  "./xslt/2_FM_Topic_sequnce.xsl",
  "./xslt/3_FM_topic_structure.xsl",
  "./xslt/3-1_FM_LIST.xsl",
  "./xslt/4_FM_LIST_Handle.xsl",
  "./xslt/5_FM_List_sequence.xsl",
  "./xslt/6_FM_List_sequence.xsl",
];

function getXSLTFileSequence() {
  return executionSequence;
}

module.exports = { getXSLTFileSequence };
