<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    
    <xsl:key name="kHeaderByPreceding"
        match="topics/*[starts-with(name(),'h')]"
        use="generate-id(preceding-sibling::*
        [starts-with(name(),'h')]
        [substring(name(current()),2)
        > substring(name(),2)][1])"/>
    <xsl:key name="kElementByPreceding"
        match="topics/*[not(starts-with(name(),'h'))]"
        use="generate-id(preceding-sibling::*
        [starts-with(name(),'h')][1])"/>
    <xsl:template match="node()|@*" mode="copy">
        <xsl:copy>
            <xsl:apply-templates select="node()|@*" mode="copy"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="topics">
        <topics>
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates select="key('kHeaderByPreceding','')"/>
        </topics>
    </xsl:template>
    <xsl:template match="topics/*[starts-with(name(),'h')]">
        <topic level="{substring(name(),2)}">
            <xsl:copy-of select="@*"/>
            <!--<xsl:element name="title">-->
                <xsl:apply-templates mode="copy"/>
            <!--</xsl:element>-->
            <!--<body>-->
            <xsl:apply-templates select="key('kElementByPreceding',
                generate-id())"
                mode="copy"/>
            <!--</body>-->
            <xsl:apply-templates select="key('kHeaderByPreceding',
                generate-id())"/>
        </topic>
    </xsl:template>
    <xsl:template match="text()"/>
    
</xsl:stylesheet>