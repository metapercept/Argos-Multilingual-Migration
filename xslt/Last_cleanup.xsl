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
                <xsl:attribute name="id" select="lower-case(@id)"/>
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
                <xsl:attribute name="id" select="lower-case(@id)"/>
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
                <xsl:attribute name="id" select="lower-case(@id)"/>
            </xsl:if>
            <xsl:attribute name="xml:lang">en-us</xsl:attribute>
            <xsl:apply-templates/>
        </crown-reference>
    </xsl:template>
    
    
    <xsl:template match="task"><xsl:text>
</xsl:text>
        <xsl:text disable-output-escaping="yes">&lt;!DOCTYPE crown-task PUBLIC "-//CROWN//DTD DITA Crown Task//EN" "crown-task.dtd"&gt;</xsl:text><xsl:text>
</xsl:text>
        <crown-task>
            <xsl:if test="@id">
                <xsl:attribute name="id" select="lower-case(@id)"/>
            </xsl:if>
            <xsl:attribute name="xml:lang">en-us</xsl:attribute>
            <xsl:apply-templates/>
        </crown-task>
    </xsl:template>
    
    
    <xsl:template match="image[ancestor::fig]">
        <image>
            
            <xsl:if test="@id">
                <xsl:attribute name="id">
                    <xsl:value-of select="@id"/>
                </xsl:attribute>
            </xsl:if>
            
            <xsl:choose>
                <xsl:when test="preceding-sibling::title">
                    <xsl:attribute name="href">
                        <xsl:value-of select="concat('../graphics/com/referenced/', normalize-space(replace(substring-after(substring-before(preceding-sibling::title[1], ')'), '('), ' ', '_')) , '.pdf')"/>
                    </xsl:attribute>
                </xsl:when>
                <xsl:when test="following-sibling::legend/title">
                    <xsl:attribute name="href">
                        <xsl:value-of select="concat('../graphics/com/referenced/', normalize-space(replace(substring-after(substring-before(preceding-sibling::title[1], ')'), '('), ' ', '_')) , '.pdf')"/>
                    </xsl:attribute>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:if test="@href">
                        <xsl:attribute name="href">
                            <xsl:value-of select="@href"/>
                        </xsl:attribute>
                    </xsl:if>
                </xsl:otherwise>
            </xsl:choose>
            <xsl:apply-templates/>
        </image>
    </xsl:template>
    
    <xsl:template match="xref">
        <xsl:apply-templates/>
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
    
    <xsl:template match="cdWarning">
        <!-- First: output this warning without nested cdWarning -->
        <cdWarning>
            <xsl:apply-templates
                select="@* | node()[not(self::cdWarning)]"/>
        </cdWarning>
        
        <!-- Second: promote nested cdWarning(s) as siblings -->
        <xsl:apply-templates select="cdWarning"/>
    </xsl:template>
    
    <xsl:template match="cdWarnDescr">
        <xsl:if test="not(preceding-sibling::cdWarnHeading) and not(preceding-sibling::cdWarnDescr)">
            <cdWarnHeading/>
        </xsl:if>
        <cdWarnDescr>
            <xsl:apply-templates/>
        </cdWarnDescr>
    </xsl:template>
    
    
    
    <!-- 1) Transform: cdWarnInstructions + immediate following cdWarnDescr -->
    <xsl:template match="cdWarnInstructions[following-sibling::*[1][self::cdWarnDescr]]">
        <xsl:variable name="tailDescr" select="following-sibling::cdWarnDescr[1]"/>
        <cdWarnInstructions>
                <!-- Process instructions in a dedicated mode and pass the tail description -->
                <xsl:apply-templates select="cdWarnInstruction" mode="hpw">
                    <xsl:with-param name="tailDescrText" select="normalize-space(string($tailDescr))"/>
                </xsl:apply-templates>
            </cdWarnInstructions>
    </xsl:template>
    
    <!-- 2) Copy instructions; for the last one append <p>tail descr</p> -->
    <xsl:template match="cdWarnInstruction" mode="hpw">
        <xsl:param name="tailDescrText" as="xs:string"/>
        
        <cdWarnInstruction>
            <xsl:apply-templates select="@*|node()"/>
            
            <xsl:if test="position() = last() and $tailDescrText != ''">
                <p><xsl:value-of select="$tailDescrText"/></p>
            </xsl:if>
        </cdWarnInstruction>
    </xsl:template>
    
    <!-- 3) Suppress ONLY the cdWarnDescr that was consumed (immediately after cdWarnInstructions) -->
    <xsl:template match="cdWarnDescr[preceding-sibling::*[1][self::cdWarnInstructions]]"/>
    
    
    <xsl:template match="cdWarnInstructions[not(preceding-sibling::*)]">
        <cdWarnHeading/>
        <cdWarnInstructions>
            <xsl:apply-templates/>
        </cdWarnInstructions>
    </xsl:template>
    
    
    
    <xsl:template match="info[
        count(*) = 1
        and p
        and starts-with(p/@id, 'stepresult')
        ]">
        <stepresult>
            <xsl:apply-templates select="p/node()"/>
        </stepresult>
    </xsl:template>
    
    
    <xsl:template match="info[
        count(p) &gt; 1
        and not(p[not(starts-with(@id, 'stepresult'))])
        ]">
        <stepresult>
            <ul>
                <xsl:for-each select="p">
                    <li>
                        <xsl:apply-templates select="node()"/>
                    </li>
                </xsl:for-each>
            </ul>
        </stepresult>
    </xsl:template>
    
    
    
    <xsl:template match="step">
        <step>
            <xsl:apply-templates/>
        </step>
    </xsl:template>
    
    
    <xsl:template match="p [@base='ul']">
        <ul>
            <xsl:apply-templates/>
        </ul>
    </xsl:template>
    
    <xsl:template match="fig[following-sibling::*[1][self::table
        and tgroup/tbody/row[1]/entry[1]/p = '1'
        ]]">
        
        <xsl:variable name="table" select="following-sibling::table[1]"/>
        
        <fig>
            <xsl:apply-templates select="@*"/>
            
            <!-- image stays -->
            <xsl:apply-templates select="image"/>
            
            <legend>
                <!-- fig title moves here -->
                <xsl:apply-templates select="title"/>
                
                <items>
                    <xsl:for-each select="$table/tgroup/tbody/row">
                        <item>
                            <itemhead>
                                <xsl:value-of select="normalize-space(entry[1])"/>
                            </itemhead>
                            <itemdesc>
                                <xsl:apply-templates select="normalize-space(entry[2])"/>
                            </itemdesc>
                        </item>
                    </xsl:for-each>
                </items>
            </legend>
        </fig>
    </xsl:template>
    <xsl:template match="table[
        preceding-sibling::*[1][self::fig]
        and tgroup/tbody/row[1]/entry[1]/p = '1'
        ]"/>
    

    <xsl:template match="ul[ancestor::cdWarning]">
        <cdWarnInstructions>
            <xsl:apply-templates/>
        </cdWarnInstructions>
    </xsl:template>
    <xsl:template match="li[ancestor::ul [@type='to-do-list']]">
        <cdWarnInstruction>
            <xsl:apply-templates/>
        </cdWarnInstruction>
    </xsl:template>
    
    
    
    <xsl:template match="cmd[choicetable]">
        <!-- Output only the text (and other children that aren’t choicetable) -->
        <cmd>
            <xsl:apply-templates select="node()[not(self::choicetable)]"/>
        </cmd>
        
        <!-- Now output the table that was inside it -->
        <xsl:apply-templates select="choicetable"/>
    </xsl:template>
    
    <!-- Prevent nested choicetable from being copied inside cmd -->
    
    


    
</xsl:stylesheet>
