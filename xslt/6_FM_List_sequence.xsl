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
    
    
    <xsl:template match="topic">
        <topic xml:lang="en-us">
            <xsl:if test="@base">
                <xsl:attribute name="base" select="@base"/>
            </xsl:if>
            <xsl:attribute name="id" select="generate-id()"/>
            <xsl:attribute name="filename">
                <xsl:choose>
                    <xsl:when test="@base='task'">
                        <xsl:value-of select="'t_'"/>
                    </xsl:when>
                    <xsl:when test="@base='refernce'"/>
                    <xsl:otherwise>
                        <xsl:value-of select="'c_'"/>
                    </xsl:otherwise>
                </xsl:choose>
                <xsl:value-of select="normalize-space(lower-case(substring(./translate(title, ',.()?[]&amp;™:/%#’®-', '_'), 1 , 20)))"/>
            </xsl:attribute>
            <xsl:apply-templates select="title"/>
            <xsl:apply-templates select="revised"/>
            <xsl:element name="body">
                <xsl:apply-templates select="p | table | image | note | ul | ol | LISTING-GROUP | fig | cdWarning | items | fn | FOOTNOTES | fn-group "/>
            </xsl:element>
            <xsl:apply-templates select="topic"/>
        </topic>
    </xsl:template>
    
    
    <xsl:template match="list-item[descendant::topic]">
        <xsl:copy-of select="*"/>
        <xsl:message select="'Pls check topic insde list'"/>
    </xsl:template>
    
    <xsl:template match="cdWarning">
        <cdWarning>
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates/>
        </cdWarning>
    </xsl:template>
    
    <xsl:template match="LISTING-GROUP">
        <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="p/b[starts-with(., 'Note:')]|p[starts-with(., 'Note:')]|p/uicontrol[starts-with(., 'Note:')]">
        <note>
            <p>
                <xsl:apply-templates/>
            </p>
        </note>
    </xsl:template>
    
    <xsl:template match="ol">
        <ol>
            <xsl:apply-templates/>
        </ol>
    </xsl:template>
    
    <xsl:template match="note">
        <note>
            <!--<xsl:if test="@type">
                <xsl:attribute name="type">
                    <xsl:value-of select="@type"/>
                </xsl:attribute>
            </xsl:if>-->
            <xsl:apply-templates/>
        </note>
    </xsl:template>
    
    <xsl:template match="tgroup">
        <tgroup>
            <xsl:attribute name="cols" select="child::thead/row[1]/descendant::entry/@colspan "/>
            <xsl:apply-templates/>
        </tgroup>
        
    </xsl:template>
    
    <xsl:template match="list-item">
        <li>
            <xsl:if test="@type">
                <xsl:attribute name="base">
                    <xsl:value-of select="@type"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:apply-templates/>
        </li>
    </xsl:template>
    
    <xsl:template match="entry[not(child::p)]">
        <entry>
            <xsl:copy-of select="@* except @type"/>
            <p>
                <xsl:apply-templates/>
            </p>
        </entry>
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
                        <xsl:copy-of select="following-sibling::*[1][self::items]"/>
                    </xsl:if>
                </legend>
            </xsl:if>
            
        </fig>
    </xsl:template>
    
    <xsl:template match="@type"/>
    
    <xsl:template match="topics">
        <topics id="aaa" uri="{substring-before(@uri , '/')}">
            <xsl:apply-templates/>
        </topics>
    </xsl:template>
    
    <xsl:template match="thead[not(normalize-space())][not(child::*)]"/>
    <xsl:template match="p[not(normalize-space())][not(child::*)]"/>
    
    <xsl:template match="items[preceding-sibling::*[1][self::fig]]"/>
    
</xsl:stylesheet>

