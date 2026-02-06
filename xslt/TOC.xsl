<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
    xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
    xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
    exclude-result-prefixes="xs w wp a pic xlink" version="2.0">

    <xsl:output doctype-public="-//OASIS//DTD DITA Map//EN" doctype-system="map.dtd"
        indent="yes"/>
    
    
    <xsl:variable name="name" select="topics/topic[1]/title"/>
    <xsl:variable name="folder_name" select="topics/@folder"/>
    <xsl:template match="topics">
        <xsl:variable name="topic_id" select="lower-case(translate(title, ' ,.()?[]&amp;™:/%#', '_'))"/>
        <xsl:variable name="topic_uri" select="topics/@uri"/>

        <xsl:result-document href="{$folder_name}/{concat('m_', $folder_name)}.ditamap" method="xml">
            <map id="{generate-id()}" xml:lang="en-us">
                <title>
                    <xsl:value-of select="$name"/>
                </title>
                
                <xsl:for-each select="topic">
                    <xsl:variable name="subsection" select="lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))"/>
                    <topicref href="{$subsection}.dita" navtitle="{normalize-space(title)}">
                        <xsl:if test="body[not(child::*)]">
                            <xsl:attribute name="topichead">yes</xsl:attribute>
                        </xsl:if>
                        
                        <xsl:for-each select="topic">
                            <xsl:variable name="subsection2"
                                select="lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))"/>
                            <topicref href="{$subsection2}.dita" navtitle="{normalize-space(title)}">
                                <xsl:if test="body[not(child::*)]">
                                    <xsl:attribute name="topichead">yes</xsl:attribute>
                                </xsl:if>
                                <xsl:for-each select="topic">
                                    <xsl:variable name="subsection3"
                                        select="lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))"/>
                                    <topicref href="{$subsection3}.dita" navtitle="{normalize-space(title)}">
                                        <xsl:if test="body[not(child::*)]">
                                            <xsl:attribute name="topichead">yes</xsl:attribute>
                                        </xsl:if>
                                        <xsl:for-each select="topic">
                                            <xsl:variable name="subsection4"
                                                select="lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))"/>
                                            <topicref href="{$subsection4}.dita" navtitle="{normalize-space(title)}">
                                                <xsl:if test="body[not(child::*)]">
                                                    <xsl:attribute name="topichead">yes</xsl:attribute>
                                                </xsl:if>
                                                <xsl:for-each select="topic">
                                                    <xsl:variable name="subsection5"
                                                        select="lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))"/>
                                                    <topicref href="{$subsection5}.dita" navtitle="{normalize-space(title)}">
                                                        <xsl:if test="body[not(child::*)]">
                                                            <xsl:attribute name="topichead">yes</xsl:attribute>
                                                        </xsl:if>
                                                    </topicref>
                                                </xsl:for-each>
                                            </topicref>
                                        </xsl:for-each>
                                    </topicref>
                                </xsl:for-each>
                            </topicref>
                        </xsl:for-each>
                    </topicref>
                </xsl:for-each>
            </map>
        </xsl:result-document>


    </xsl:template>


</xsl:stylesheet>
