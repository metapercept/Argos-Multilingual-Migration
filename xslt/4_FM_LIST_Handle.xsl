<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
    xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
    xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
    exclude-result-prefixes="xs w wp a pic xlink r m"
    version="2.0">
    
    <xsl:strip-space elements="*"/>
    
    <xsl:template match="node()|@*">
        <xsl:copy>
            <xsl:apply-templates select="node()|@*"/>
        </xsl:copy>
    </xsl:template>
    
    
    <xsl:template match="list-item [@style='ListNum1'] | list-item [@style='ListNum2'] | list-item [@style='ListNum3'] | list-item [@style='ListNum4'] | list-item [@style='ListNum5']">
        <xsl:if test="not(preceding-sibling::*[1][self::list-item])">
            <xsl:text disable-output-escaping="yes"><![CDATA[<LISTING-GROUP>]]></xsl:text>
        </xsl:if>
        <xsl:copy>
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
        <xsl:if test="not(following-sibling::*[1][self::list-item])">
            <xsl:text disable-output-escaping="yes"><![CDATA[</LISTING-GROUP>]]></xsl:text>
        </xsl:if>
    </xsl:template>
    
    
    <xsl:template match="li [@type='bullet']">
        <xsl:if test="not(preceding-sibling::*[1][self::li])">
            <xsl:text disable-output-escaping="yes"><![CDATA[<ul>]]></xsl:text>
        </xsl:if>
        <xsl:copy>
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
        <xsl:if test="not(following-sibling::*[1][self::li])">
            <xsl:text disable-output-escaping="yes"><![CDATA[</ul>]]></xsl:text>
        </xsl:if>
    </xsl:template>
    
    
    <xsl:template match="table">
        <table>
            <xsl:apply-templates select="title"/>
            <tgroup>
                <xsl:element name="thead">
                    <xsl:apply-templates select="row [@type='thead']"/>
                </xsl:element>
                <xsl:element name="tbody">
                    <xsl:apply-templates select="row [@type='tbody']"/>
                </xsl:element>
                <xsl:apply-templates select="table"/>
            </tgroup>
        </table>
    </xsl:template>
    
    <xsl:template match="fig">
        <fig>
            <xsl:if test="child::*[1][self::title]">
                <xsl:copy-of select="title"/>
            </xsl:if>
            <xsl:copy-of select="image"/>
            <xsl:if test="legend">
                <legend>
                    <xsl:if test="legend/title">
                        <xsl:copy-of select="legend/title"/>
                    </xsl:if>
                </legend>
            </xsl:if>
            
        </fig>
    </xsl:template>
    
    <!--<xsl:template match="figlegend[preceding-sibling::*[1][self::fig]]"/>-->
    
    <xsl:template match="row[ancestor::items]">
        <item>
            <xsl:apply-templates/>
        </item>
    </xsl:template>
    
    <xsl:template match="entry[1][ancestor::items]">
        <itemhead>
            <xsl:apply-templates/>
        </itemhead>
    </xsl:template>
    <xsl:template match="entry[2][ancestor::items]">
        <itemdesc>
            <xsl:apply-templates/>
        </itemdesc>
    </xsl:template>
    
    
    <xsl:template match="topic[child::list-item [@style='ListNum1']]">
        <topic base="task">
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates/>
        </topic>
    </xsl:template>
    
    <!--<xsl:template match="topic[@base='task'][not(descendant::list-item)]">
        <topic>
            <xsl:copy-of select="@* except @base"/>
            <xsl:apply-templates/>
        </topic>
    </xsl:template>-->
    
    <xsl:template match="topic[child::title[following-sibling::*[1][self::table]]]">
        <topic base="refernce">
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates/>
        </topic>
    </xsl:template>
    
    
</xsl:stylesheet>