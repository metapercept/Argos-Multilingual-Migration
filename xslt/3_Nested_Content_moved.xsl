<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    exclude-result-prefixes="xs xd"
    version="2.0">
    
    
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
    
    <xsl:template match="li">
        <xsl:choose>
            <xsl:when test="@type='bull2' and not(preceding-sibling::li [@type='bull1'])">
                <li type="bull1">
                    <xsl:apply-templates/>
                </li>
            </xsl:when>
            <xsl:when test="@type='bull3' and not(preceding-sibling::li [@type='bull2'])">
                <li type="bull1">
                    <xsl:apply-templates/>
                </li>
            </xsl:when>
            <xsl:when test="@type='bull3' and preceding-sibling::li [@type='bull2'][not(preceding-sibling::li [@type='bull1'])]">
                <li type="bull2">
                    <xsl:apply-templates/>
                </li>
            </xsl:when>
            <xsl:otherwise>
                <li>
                    <xsl:copy-of select="@*"/>
                    <xsl:apply-templates/>
                </li>
            </xsl:otherwise>
        </xsl:choose>
        
    </xsl:template>
    
    
    
    
    
    
    <xsl:template match="tgroup[child::tgroup]">
        <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="topic">
        <xsl:choose>
            <xsl:when test="@base='task'">
                <topic>
                    <xsl:apply-templates select="@* except @filename"/>
                    <xsl:attribute name="filename">
                        <xsl:value-of select="concat('t_', @filename)"/>
                    </xsl:attribute>
                    <xsl:apply-templates/>
                    
                </topic>
            </xsl:when>
            
            <xsl:when test="@base='refernce'">
                <topic>
                    <xsl:apply-templates select="@* except @filename"/>
                    <xsl:attribute name="filename">
                        <xsl:value-of select="concat('r_', @filename)"/>
                    </xsl:attribute>
                    <xsl:apply-templates/>
                    
                </topic>
            </xsl:when>
            
            <xsl:otherwise>
                <topic>
                    <xsl:apply-templates select="@* except @filename"/>
                    <xsl:attribute name="filename">
                        <xsl:value-of select="concat('c_', @filename)"/>
                    </xsl:attribute>
                    <xsl:apply-templates/>
                </topic>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="topics">
        <topics>
            <xsl:apply-templates select="@* except @folder"/>
            <xsl:attribute name="folder">
                <xsl:value-of select="translate(@folder, '-,. ', '_')"/>
            </xsl:attribute>
            <xsl:apply-templates/>
        </topics>
    </xsl:template>
    
    
    <xsl:template match="cdWarning[note]">
        <!-- output the cdWarning WITHOUT nested notes -->
        <cdWarning>
            <xsl:apply-templates select="@*"/>
            <xsl:apply-templates select="node()[not(self::note)]"/>
        </cdWarning>
        
        <!-- output the nested notes as siblings -->
        <xsl:apply-templates select="note"/>
    </xsl:template>

</xsl:stylesheet>
