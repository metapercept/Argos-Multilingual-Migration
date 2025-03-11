<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:mf="http://example.com/mf"
    expand-text="yes"
    exclude-result-prefixes="#all"
    version="3.0">
    
    <xsl:param name="format-map" as="map(xs:integer, xs:string)"
        select="map { 1 : 'a', 2 : '1', 3 : 'a' }"/>
    
    <xsl:function name="mf:format" as="xs:string">
        <xsl:param name="number" as="xs:integer"/>
        <xsl:param name="level" as="xs:integer"/>
        <xsl:variable name="formatted-number"
            select="format-integer($number, $format-map($level))"/>
        <xsl:sequence
            select="if ($level = 1)
            then  $formatted-number || '.'
            else  '(' || $formatted-number || ')'"/>
    </xsl:function>
    
    <xsl:function name="mf:group" as="node()*">
        <xsl:param name="items" as="element(list-item)*"/>
        <xsl:param name="level" as="xs:integer"/>
        <xsl:where-populated>
            <ol type="ListNum{$level}">
                <xsl:for-each-group select="$items" group-starting-with="list-item[@style = 'ListNum' || $level]">
                    <xsl:copy>
                        <xsl:apply-templates select="node()|@*, mf:group(tail(current-group()), $level + 1)"/>
                    </xsl:copy>  
                </xsl:for-each-group>  
            </ol>
        </xsl:where-populated>
    </xsl:function>
    
    <xsl:mode on-no-match="shallow-copy"/>
    
    
    <xsl:template match="LISTING-GROUP">
        <xsl:copy>
            
            <xsl:sequence select="mf:group(list-item, 1)"/>
            
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="image">
        <xsl:variable name="href">
            <xsl:choose>
                <xsl:when test="ancestor::topic/@id">
                    <xsl:if test="count(ancestor::topic/@id) = 1">
                        <xsl:value-of select="'../image/'"/>
                    </xsl:if>
                    <xsl:if test="count(ancestor::topic/@id) = 2">
                        <xsl:value-of select="'../../image/'"/>
                    </xsl:if>
                    <xsl:if test="count(ancestor::topic/@id) = 3">
                        <xsl:value-of select="'../../../image/'"/>
                    </xsl:if>
                    <xsl:if test="count(ancestor::topic/@id) = 4">
                        <xsl:value-of select="'../../../image/'"/>
                    </xsl:if>
                    <xsl:if test="count(ancestor::topic/@id) = 5">
                        <xsl:value-of select="'../../../image/'"/>
                    </xsl:if>
                    <xsl:if test="count(ancestor::topic/@id) = 6">
                        <xsl:value-of select="'../../../image/'"/>
                    </xsl:if>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:message select="'Please set image path'"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <image>
            <xsl:if test="@href">
                <xsl:attribute name="href">
                    <xsl:value-of select="concat($href, replace(concat('i_', @href), ' ', '_'))"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:apply-templates/>
        </image>
    </xsl:template>
    
</xsl:stylesheet>