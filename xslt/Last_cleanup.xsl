<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="xs"
    version="2.0">
    
    <xsl:template match="@*|node()">
        <xsl:copy copy-namespaces="no">
            <xsl:apply-templates select="@* except @class | node()"/>
        </xsl:copy>
    </xsl:template>

    <!--<xsl:output indent="yes"/>-->
    <!--Topic to Concept-->


    <xsl:template match="map">
        <xsl:text>
</xsl:text>
        <xsl:text disable-output-escaping="yes">&lt;!DOCTYPE crown-map PUBLIC "-//CROWN//DTD DITA Crown Map//EN" "crown-map.dtd"&gt;</xsl:text><xsl:text>
</xsl:text>
        <crown-map>
            <xsl:if test="@id">
                <xsl:attribute name="id" select="@id"/>
            </xsl:if>
            <xsl:attribute name="xml:lang">en-us</xsl:attribute>
            <xsl:apply-templates/>
        </crown-map>
    </xsl:template>
    
    <xsl:template match="topic"><xsl:text>
</xsl:text>
        <xsl:text disable-output-escaping="yes">&lt;!DOCTYPE crown-concept PUBLIC "-//CROWN//DTD DITA Crown Concept//EN" "crown-concept.dtd"&gt;</xsl:text><xsl:text>
</xsl:text>
        <crown-concept>
            <xsl:if test="@id">
                <xsl:attribute name="id" select="@id"/>
            </xsl:if>
            <xsl:attribute name="xml:lang">en-us</xsl:attribute>
            <xsl:apply-templates/>
        </crown-concept>
    </xsl:template>
    
    
    
    <xsl:template match="body">
        <xsl:choose>
            <xsl:when test="ancestor::topic[@base='refernce']">
                <refbody>
                    <xsl:apply-templates/>
                </refbody>
            </xsl:when>
            <xsl:otherwise>
                <conbody>
                    <xsl:apply-templates/>
                </conbody>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    
    <xsl:template match="topic[@base='refernce']"><xsl:text>
</xsl:text>
        <xsl:text disable-output-escaping="yes">&lt;!DOCTYPE crown-reference PUBLIC "-//CROWN//DTD DITA Crown Reference//EN" "crown-reference.dtd"&gt;</xsl:text><xsl:text>
</xsl:text>
        <crown-reference>
            <xsl:if test="@id">
                <xsl:attribute name="id" select="@id"/>
            </xsl:if>
            <xsl:attribute name="xml:lang">en-us</xsl:attribute>
            <xsl:apply-templates/>
        </crown-reference>
    </xsl:template>
    
    
    <xsl:template match="crown-task"><xsl:text>
</xsl:text>
        <xsl:text disable-output-escaping="yes">&lt;!DOCTYPE crown-task PUBLIC "-//CROWN//DTD DITA Crown Task//EN" "crown-task.dtd"&gt;</xsl:text><xsl:text>
</xsl:text>
        <crown-task>
            <xsl:if test="@id">
                <xsl:attribute name="id" select="@id"/>
            </xsl:if>
            <xsl:attribute name="xml:lang">en-us</xsl:attribute>
            <xsl:apply-templates/>
        </crown-task>
    </xsl:template>
    
    
    <xsl:template match="image">
        <image>
            <xsl:attribute name="href"><xsl:value-of select="translate(@href, ' .-', '_')"/></xsl:attribute>
        </image>
    </xsl:template>
    
    <xsl:template match="xref">
        <xref>
            <xsl:attribute name="href">
                <xsl:value-of select="@href"/>
            </xsl:attribute>
            <xsl:apply-templates/>
        </xref>
    </xsl:template>
    <!--cols variable-->
    
    <xsl:template match="topicref[@topichead='yes']">
        <topichead>
            <xsl:attribute name="navtitle">
                <xsl:value-of select="@navtitle"/>
            </xsl:attribute>
            <xsl:apply-templates/>
        </topichead>
    </xsl:template>
    
    <xsl:template match="tgroup">
        <xsl:variable name="col1">
            <colspec colname="c1" colnum="1"/>
        </xsl:variable>
        <xsl:variable name="col2">
            <colspec colname="c1" colnum="1"/>
            <colspec colname="c2" colnum="2"/>
        </xsl:variable>
        <xsl:variable name="col3">
            <colspec colname="c1" colnum="1"/>
            <colspec colname="c2" colnum="2"/>
            <colspec colname="c3" colnum="3"/>
        </xsl:variable>
        <xsl:variable name="col4">
            <colspec colname="c1" colnum="1"/>
            <colspec colname="c2" colnum="2"/>
            <colspec colname="c3" colnum="3"/>
            <colspec colname="c4" colnum="4"/>
        </xsl:variable>
        <xsl:variable name="col5">
            <colspec colname="c1" colnum="1"/>
            <colspec colname="c2" colnum="2"/>
            <colspec colname="c3" colnum="3"/>
            <colspec colname="c4" colnum="4"/>
            <colspec colname="c5" colnum="5"/>
        </xsl:variable>
        <xsl:variable name="col6">
            <colspec colname="c1" colnum="1"/>
            <colspec colname="c2" colnum="2"/>
            <colspec colname="c3" colnum="3"/>
            <colspec colname="c4" colnum="4"/>
            <colspec colname="c5" colnum="5"/>
            <colspec colname="c6" colnum="6"/>
        </xsl:variable>
        <xsl:variable name="col7">
            <colspec colname="c1" colnum="1"/>
            <colspec colname="c2" colnum="2"/>
            <colspec colname="c3" colnum="3"/>
            <colspec colname="c4" colnum="4"/>
            <colspec colname="c5" colnum="5"/>
            <colspec colname="c6" colnum="6"/>
            <colspec colname="c7" colnum="7"/>
        </xsl:variable>
        <xsl:variable name="col8">
            <colspec colname="c1" colnum="1"/>
            <colspec colname="c2" colnum="2"/>
            <colspec colname="c3" colnum="3"/>
            <colspec colname="c4" colnum="4"/>
            <colspec colname="c5" colnum="5"/>
            <colspec colname="c6" colnum="6"/>
            <colspec colname="c7" colnum="7"/>
            <colspec colname="c8" colnum="8"/>
        </xsl:variable>
        <tgroup cols="{@cols}">
            <xsl:choose>
                <xsl:when test="@cols='1'">
                    <xsl:copy-of select="$col1"/>
                </xsl:when>
                <xsl:when test="@cols='2'">
                    <xsl:copy-of select="$col2"/>
                </xsl:when>
                <xsl:when test="@cols='3'">
                    <xsl:copy-of select="$col3"/>
                </xsl:when>
                <xsl:when test="@cols='4'">
                    <xsl:copy-of select="$col4"/>
                </xsl:when>
                <xsl:when test="@cols='5'">
                    <xsl:copy-of select="$col5"/>
                </xsl:when>
                <xsl:when test="@cols='6'">
                    <xsl:copy-of select="$col6"/>
                </xsl:when>
                <xsl:when test="@cols='7'">
                    <xsl:copy-of select="$col7"/>
                </xsl:when>
                <xsl:when test="@cols='8'">
                    <xsl:copy-of select="$col8"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:message select="'Pls check cols'"/>
                </xsl:otherwise>
            </xsl:choose>
            <xsl:apply-templates/>
        </tgroup>
        
    </xsl:template>
    
    
</xsl:stylesheet>
