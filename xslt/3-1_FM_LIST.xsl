<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    exclude-result-prefixes="xs xd"
    version="2.0">
    
    <!--    <xsl:output indent="yes"/>
    <xsl:strip-space elements="*"/>-->
    
    <xsl:key name="orphan_sect_siblings" 
        match="*[not(self::list-item)][preceding-sibling::list-item]" 
        use="preceding-sibling::list-item[1]/generate-id()"/>
    
    <xsl:template match="@*|node()" mode="#all">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="list-item[following-sibling::*[1][not(self::list-item)]]">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
            <xsl:if test="not(following-sibling::*[1][self::topic])">
                <xsl:apply-templates select="key('orphan_sect_siblings',generate-id())" mode="keep"/>
            </xsl:if>
        </xsl:copy>
        
        <xsl:if test="following-sibling::*[1][self::topic]">
            <xsl:apply-templates select="key('orphan_sect_siblings',generate-id())" mode="keep"/>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="*[not(self::list-item)][preceding-sibling::list-item]"/>
    
</xsl:stylesheet>
