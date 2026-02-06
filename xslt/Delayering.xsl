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
    
    <xsl:output method="xml" encoding="UTF-8"/>
    <xsl:strip-space elements="*"/>
    
    <xsl:template match="@* | node()">
        <xsl:copy copy-namespaces="no">
            <xsl:apply-templates select="@* | node()"/>
        </xsl:copy>
    </xsl:template>
    
    <xsl:output method="xml" doctype-public="-//OASIS//DTD DITA Topic//EN" doctype-system="topic.dtd" indent="yes"/>
    
    <xsl:variable name="topic_id" select="topics/@filename"/>
    <xsl:variable name="folder_name" select="topics/@folder"/>
    
    <xsl:template match="topics">
        
        <xsl:variable name="Topic_Folder" select="lower-case(replace(@filename, ' ', '_'))"/>
        
        <xsl:for-each select="topic[@id]">
            <xsl:variable name="first_level_topic_id" select="lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))"/>
            <xsl:result-document
                href="{$folder_name}/{lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))}.dita">
                <xsl:copy copy-namespaces="no">
                    <xsl:apply-templates select="@*, node() except (topic[@id])"/>
                </xsl:copy>
            </xsl:result-document>
            
            <xsl:for-each select="topic">
                <xsl:variable name="second_topic_level" select="lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))"/>
                <xsl:result-document
                    href="{$folder_name}/{lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))}.dita">
                    <xsl:copy copy-namespaces="no">
                        <xsl:apply-templates select="@*, node() except (topic[@id])"/>
                    </xsl:copy>
                </xsl:result-document>
                
                <xsl:for-each select="topic[@id]">
                    <xsl:variable name="third_topic_level" select="lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))"/>
                    <xsl:result-document
                        href="{$folder_name}/{lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))}.dita">
                        <xsl:copy copy-namespaces="no">
                            <xsl:apply-templates select="@*, node() except (topic[@id])"/>
                        </xsl:copy>
                    </xsl:result-document>
                    <xsl:for-each select="topic[@id]">
                        <xsl:result-document
                            href="{$folder_name}/{lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))}.dita">
                            <xsl:copy copy-namespaces="no">
                                <xsl:apply-templates select="@*, node() except (topic[@id])"/>
                            </xsl:copy>
                        </xsl:result-document>
                        
                        <xsl:for-each select="topic[@id]">
                            <xsl:result-document
                                href="{$folder_name}/{lower-case(translate(@filename, ' ,.()?[]&amp;™:/%#', '_'))}.dita">
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
    
    <xsl:template match="ol">
        <ol>
            <xsl:apply-templates/>
        </ol>
    </xsl:template>
    <xsl:template match="ul|LD4-Dash4List">
        <ul>
            <xsl:if test="@type='to-do-list'">
                <xsl:attribute name="type">to-do-list</xsl:attribute>
            </xsl:if>
            <xsl:apply-templates/>
        </ul>
    </xsl:template>
    
    <xsl:template match="li|list-item|LD4-Dash4">
        <li>
            <xsl:apply-templates/>
        </li>
    </xsl:template>
    
    <xsl:template match="//ul[parent::ullist[following-sibling::LISTING-GROUP[ancestor::topic[@base='task']]]]">
        <p base="ul">
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    
    
    <xsl:template match="cdWarning[following-sibling::*[1][self::ul[@type='to-do-list']]]">
        <cdWarning>
            <xsl:apply-templates select="@*"/>
            <xsl:apply-templates select="node()"/>
            
            <!-- move the following to-do list inside -->
            <xsl:apply-templates select="following-sibling::ul[@type='to-do-list'][1]"/>
        </cdWarning>
    </xsl:template>
    
    
    <xsl:template match="fig">
        <fig>
            <!-- preserve all attributes, e.g., id -->
            <xsl:copy-of select="@*"/>
            
            <!-- First output the title element -->
            <xsl:apply-templates select="title"/>
            
            <!-- Then output image element -->
            <xsl:apply-templates select="image"/>
            
            <!-- Then any other child nodes if needed -->
            <xsl:apply-templates select="node()[not(self::title or self::image)]"/>
        </fig>
    </xsl:template>
    
    
    
    <xsl:template match="choption[not(preceding-sibling::*[1][self::chdesc])]">
        <xsl:text disable-output-escaping="yes">&lt;choicetable&gt;&lt;chrow&gt;</xsl:text><choption><xsl:apply-templates/></choption>
    </xsl:template>
    
    <xsl:template match="chdesc[not(following-sibling::*[1][self::choption])]">
        <chdesc><xsl:apply-templates/></chdesc><xsl:text disable-output-escaping="yes">&lt;/chrow&gt;&lt;/choicetable&gt;</xsl:text>
    </xsl:template>
    
    <xsl:template match="choption[preceding-sibling::*[1][self::chdesc]]">
        <xsl:text disable-output-escaping="yes">&lt;/chrow&gt;&lt;chrow&gt;</xsl:text><choption><xsl:apply-templates/></choption>
    </xsl:template>
    
    <xsl:template match="LISTING-GROUP | ullist">
        <xsl:apply-templates/>
    </xsl:template>
    
</xsl:stylesheet>
