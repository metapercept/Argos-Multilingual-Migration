<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
    xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
    xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
    exclude-result-prefixes="xs w wp a pic xlink r m" version="2.0">

    <xsl:strip-space elements="*"/>

    <xsl:template match="node() | @*">
        <xsl:copy>
            <xsl:apply-templates select="node() | @*"/>
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="topic[@type = '3'][preceding-sibling::*[1][self::topic[@type = '1']]]">
        <topic type="2">
            <xsl:apply-templates/>
        </topic>
    </xsl:template>

    <xsl:template match="topic[@type = '4'][preceding-sibling::*[1][self::topic[@type = '1']]]">
        <topic type="2">
            <xsl:apply-templates/>
        </topic>
    </xsl:template>
    
    <xsl:template match="topic[@type = '4'][preceding-sibling::*[1][self::topic[@type = '2']]]">
        <topic type="3">
            <xsl:apply-templates/>
        </topic>
    </xsl:template>
    
    <xsl:template match="topic[@type = '5'][preceding-sibling::*[1][self::topic[@type = '1']]]">
        <topic type="2">
            <xsl:apply-templates/>
        </topic>
    </xsl:template>
    <xsl:template match="topic[@type = '3'][preceding-sibling::*[1][self::topic[@type = '1']]]">
        <topic type="2">
            <xsl:apply-templates/>
        </topic>
    </xsl:template>


    <xsl:template match="row">
        <row>
            <xsl:if test="child::entry/@type = 'thead'">
                <xsl:attribute name="type">
                    <xsl:value-of select="'thead'"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:if test="child::entry/@type = 'tbody'">
                <xsl:attribute name="type">
                    <xsl:value-of select="'tbody'"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:apply-templates/>
        </row>
    </xsl:template>
    
    
    <xsl:template match="row[ancestor::fig]">
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="entry[ancestor::fig]">
        <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="title[child::legend]">
        <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="table[child::row[1]/entry[text()= '1']][preceding-sibling::*[1][self::fig]]">
        <items>
            <xsl:apply-templates/>
        </items>
    </xsl:template>
    
    <xsl:template match="entry">
        <entry>
            <xsl:copy-of select="@* except @rowspan"/>
            <xsl:if test="@rowspan">
                <xsl:attribute name="morerows">
                    <xsl:value-of select="@rowspan - 1"/>
                </xsl:attribute>
            </xsl:if>
            
            <xsl:apply-templates/>
        </entry>
    </xsl:template>
    
    

</xsl:stylesheet>
