<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
    xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
    exclude-result-prefixes="xs w wp a pic xlink"
    version="2.0">
    
    <xsl:output method="xml" encoding="UTF-8" indent="yes"/>
    
    
    <xsl:template match="@* | node()">
        <xsl:copy copy-namespaces="no">
            <xsl:apply-templates select="@* | node()"/>
        </xsl:copy>
    </xsl:template>
    
    <xsl:output method="xml" doctype-public="-//OASIS//DTD DITA Topic//EN" doctype-system="topic.dtd" indent="yes"/>
    
    <xsl:variable name="topic_id" select="topics/@filename"/>
    
    <xsl:template match="topics[@id]">
        
        <xsl:variable name="Topic_Folder" select="lower-case(replace(@filename, ' ', '_'))"/>
        
        <xsl:for-each select="topic[@id]">
            <xsl:variable name="first_level_topic_id" select="lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))"/>
            <xsl:result-document
                href="{$first_level_topic_id}/{lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))}.dita">
                <xsl:copy copy-namespaces="no">
                    <xsl:apply-templates select="@*, node() except (topic[@id])"/>
                </xsl:copy>
            </xsl:result-document>
            
            <xsl:for-each select="topic[@id]">
                <xsl:variable name="second_topic_level" select="lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))"/>
                <xsl:result-document
                    href="{$first_level_topic_id}/{$second_topic_level}/{lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))}.dita">
                    <xsl:copy copy-namespaces="no">
                        <xsl:apply-templates select="@*, node() except (topic[@id])"/>
                    </xsl:copy>
                </xsl:result-document>
                
                <xsl:for-each select="topic[@id]">
                    <xsl:variable name="third_topic_level" select="lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))"/>
                    <xsl:result-document
                        href="{$first_level_topic_id}/{$second_topic_level}/{$third_topic_level}/{lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))}.dita">
                        <xsl:copy copy-namespaces="no">
                            <xsl:apply-templates select="@*, node() except (topic[@id])"/>
                        </xsl:copy>
                    </xsl:result-document>
                    
                    <xsl:for-each select="topic[@id]">
                        <xsl:result-document
                            href="{$first_level_topic_id}/{$second_topic_level}/{$third_topic_level}/{lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))}.dita">
                            <xsl:copy copy-namespaces="no">
                                <xsl:apply-templates select="@*, node() except (topic[@id])"/>
                            </xsl:copy>
                        </xsl:result-document>
                        
                        <xsl:for-each select="topic[@id]">
                            <xsl:result-document
                                href="{$first_level_topic_id}/{$second_topic_level}/{$third_topic_level}/{lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))}.dita">
                                <xsl:copy copy-namespaces="no">
                                    <xsl:apply-templates select="@*, node() except (topic[@id])"/>
                                </xsl:copy>
                            </xsl:result-document>
                        </xsl:for-each>
                    </xsl:for-each>
                    
                </xsl:for-each>
            </xsl:for-each>
        </xsl:for-each>
    </xsl:template>
    
    <xsl:template match="revised"></xsl:template>
    <xsl:template match="equation-inline">
        <xsl:apply-templates/>
    </xsl:template>
    
    
    <xsl:template match="ol">
        <xsl:choose>
            <xsl:when test="child::li[@base='Workstep1']">
                <steps>
                    <xsl:apply-templates/>
                </steps>
            </xsl:when>
            <xsl:otherwise>
                <ol>
                    <xsl:apply-templates/>
                </ol>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="li[@base='Workstep1'][not(ancestor::table)]">
        <step><cmd>
            <xsl:apply-templates/>
        </cmd></step>
    </xsl:template>
    
    <xsl:template match="fig">
        <xsl:choose>
            <xsl:when test="descendant::items">
                <fig>
                    <xsl:attribute name="id">
                        <xsl:value-of select="legend/title/A/@ID"/>
                    </xsl:attribute>
                    <xsl:if test="child::*[1][self::title]">
                        <xsl:copy-of select="title"/>
                    </xsl:if>
                    <xsl:apply-templates/>
                </fig>
            </xsl:when>
            <xsl:otherwise>
                <fig>
                    <xsl:if test="legend/title/A">
                        <xsl:attribute name="id">
                            <xsl:value-of select="legend/title/A/@ID"/>
                        </xsl:attribute>
                    </xsl:if>
                    <xsl:if test="child::*[1][self::title]">
                        <xsl:copy-of select="title"/>
                    </xsl:if>
                    <xsl:if test="legend/title">
                        <title><xsl:value-of select="."/></title>
                    </xsl:if>
                    <xsl:copy-of select="image"/>
                </fig>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    
    
    <xsl:template match="A[@CLASS='XRef']">
        <xsl:variable name="id" select="ancestor::topic[1]/@id"/>
        <xref>
            <xsl:attribute name="href">
                <xsl:value-of select="concat('#',$id,'/', substring-after(substring-before(@href, ')'), '#id('))"/>
            </xsl:attribute>
            <xsl:apply-templates/>
        </xref>
    </xsl:template>    
    
</xsl:stylesheet>
